import { getLicenseMetrics } from '@/sanity/lib/client'
import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer, { type SkuOption } from '@commercelayer/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  calculateLineItemPrice,
  calculateSkuOptionsTotal,
} from '@/commercelayer/utils/prices'
import type { CompanySize } from '@/sanity/lib/queries'
// External prices URL is mananged at
// `${process.env.CL_SLUG}.commercelayer.io/admin/settings/markets/${marketId}/edit`
// e.g. https://owenhoskins.ngrok.app/api/price

/* ------------------------------------------------------------------ */
/*  Module-level cache — survives across requests within the same      */
/*  serverless invocation. TTL prevents stale data.                    */
/* ------------------------------------------------------------------ */
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

let cachedCl: ReturnType<typeof CommerceLayer> | null = null
let cachedClExpiry = 0

let cachedSizes: CompanySize[] | null = null
let cachedSizesExpiry = 0

let cachedSkuOptions: SkuOption[] | null = null
let cachedSkuOptionsExpiry = 0

async function getCl() {
  const now = Date.now()
  if (cachedCl && now < cachedClExpiry) return cachedCl

  const token = await authenticate('client_credentials', {
    clientId: process.env.CL_SYNC_CLIENT_ID,
    clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
    endpoint: process.env.CL_ENDPOINT,
  })
  cachedCl = CommerceLayer({
    organization: process.env.CL_SLUG,
    accessToken: token.accessToken,
  })
  cachedClExpiry = now + CACHE_TTL_MS
  return cachedCl
}

async function getSizes() {
  const now = Date.now()
  if (cachedSizes && now < cachedSizesExpiry) return cachedSizes

  const { sizes } = await getLicenseMetrics()
  cachedSizes = sizes
  cachedSizesExpiry = now + CACHE_TTL_MS
  return cachedSizes
}

async function getSkuOptions() {
  const now = Date.now()
  if (cachedSkuOptions && now < cachedSkuOptionsExpiry) return cachedSkuOptions

  const cl = await getCl()
  cachedSkuOptions = await cl.sku_options.list()
  cachedSkuOptionsExpiry = now + CACHE_TTL_MS
  return cachedSkuOptions
}

type IncludedLineItem = {
  type: string
  attributes: {
    sku_code: string
    created_at?: string
    metadata?: { parentUid?: string; license?: { parentUid?: string } }
    [key: string]: any
  }
}

type PriceCalculationRequest = {
  data: {
    attributes: {
      sku_code: string
      unit_amount_cents: number
      quantity: number
      created_at?: string
      metadata: any
    }
  }
  included: IncludedLineItem[]
}

type PriceCalculationResponse = {
  sku_code: string
  unit_amount_cents: number
}

/*
  "data": {
    "id": "xYZkjABcde",
    "type": "line_items",
    "links": { ... },
    "attributes": {
      "quantity": 2,
      "sku_code": "TSHIRTMM000000FFFFFFXLXX",
      "_external_price": true
    },
    "relationships": { ... },
    "meta": { ... }
  },
*/

// https://docs.commercelayer.io/core/external-resources/external-prices
// The request payload is a JSON:API-compliant object you can query to perform your own computation

export async function POST(
  req: NextRequest,
  res: NextResponse<PriceCalculationResponse>
) {
  const body = await req.json()
  // console.log('Price req.json(): body... ', body)
  const {
    data: {
      attributes: { quantity, sku_code, created_at, metadata },
    },
    included,
  } = body as PriceCalculationRequest

  // shared secret: 110eedcdc3dc650fce5a7e4697ee768a
  // We recommend verifying the callback authenticity by signing the payload with that shared secret and comparing the result with the callback signature header.

  try {
    // Parallel fetch from cache (warm) or network (cold)
    const [sizes, allSkuOptions] = await Promise.all([
      getSizes(),
      getSkuOptions(),
    ])

    const size = sizes.find(
      ({ value }) => value === metadata.license?.size?.value
    )

    if (!size) {
      console.error('[PRICE API] Unknown license size:', metadata.license?.size)
      return NextResponse.json({
        success: true,
        status: 200,
        now: Date.now(),
        data: { sku_code, unit_amount_cents: 0 },
      })
    }
    let unit_amount_cents: number

    if (metadata.projectionType === 'group') {
      // ── GROUP PROJECTION ──────────────────────────────────────────
      // Sum per-style prices using perStyleTypes and the group batchSize.
      const perStyleTypes: Record<string, string[]> =
        metadata.license?.perStyleTypes ?? {}
      const batchSize = metadata.batchSize ?? Object.keys(perStyleTypes).length

      let groupTotal = 0
      for (const [styleSkuCode, typeRefs] of Object.entries(perStyleTypes)) {
        const styleOptions = allSkuOptions.filter(({ reference }) =>
          typeRefs.includes(reference)
        )
        const stylePrice = calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: size.modifier,
          count: batchSize,
        })
        groupTotal += stylePrice
      }

      unit_amount_cents = groupTotal

      console.log('[PRICE API] GROUP projection:', {
        sku_code,
        groupName: metadata.groupName,
        styleCount: Object.keys(perStyleTypes).length,
        batchSize,
        companySizeModifier: size.modifier,
        unit_amount_cents,
      })
    } else {
      // ── STYLE PROJECTION (default) ────────────────────────────────
      // Use batchSize from metadata if available (batch creation via commitSelections),
      // otherwise count from included (recalculation after add/remove)
      const siblings = included.filter(
        ({ type, attributes }) =>
          type === 'line_items' &&
          attributes.sku_code !== sku_code &&
          attributes.metadata?.parentUid === metadata.parentUid
      )

      const count = metadata.batchSize ?? siblings.length + 1

      const selectedTypes = allSkuOptions.filter(({ reference }) =>
        metadata.license?.types?.find((val: string) => val === reference)
      )

      unit_amount_cents = calculateLineItemPrice({
        skuOptions: selectedTypes,
        sizeModifier: size.modifier,
        count,
      })

      console.log('[PRICE API] STYLE projection:', {
        sku_code,
        count,
        batchSize: metadata.batchSize,
        siblingCount: siblings.length + 1,
        skuOptionsTotal: calculateSkuOptionsTotal(selectedTypes),
        companySizeModifier: size.modifier,
        unit_amount_cents,
      })
    }

    const data = { sku_code, unit_amount_cents }

    return NextResponse.json({
      success: true,
      status: 200,
      now: Date.now(),
      data,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      status: 500,
      success: false,
      now: Date.now(),
      message: 'Internal server error',
    })
  }
}
