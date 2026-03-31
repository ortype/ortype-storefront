import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { parseBody } from 'next-sanity/webhook'
import { NextRequest, NextResponse } from 'next/server'

// Sanity webhook projection should be:
// {_type, media[]{_key, value, label}}

const REFERENCE_ORIGIN = 'sanity-settings'
const CURRENCY_CODE = 'EUR'

interface SanityMediaItem {
  _key: string
  value: number
  label: string
}

interface SettingsWebhookBody {
  _type: string
  media?: SanityMediaItem[]
}

// ---------------------------------------------------------------------------
// Field sync handlers
// Each handler receives its slice of the webhook body and a CL client,
// and returns a summary of changes made.
// ---------------------------------------------------------------------------

interface SyncResult {
  created: number
  updated: number
  deleted: number
  errors: string[]
}

function clErrorMessage(e: unknown): string {
  // CL SDK errors often carry detail in e.errors[0].detail
  if (typeof e === 'object' && e !== null) {
    const err = e as Record<string, any>
    const detail = err.errors?.[0]?.detail || err.first?.()?.detail
    if (detail) return String(detail)
  }
  if (e instanceof Error) return e.message
  return String(e)
}

async function syncMedia(
  media: SanityMediaItem[],
  cl: ReturnType<typeof CommerceLayer>
): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, deleted: 0, errors: [] }

  // 1. Fetch ALL sku_options so we can merge by name across origins
  const allOptions = await cl.sku_options.list()

  // Lookup by reference (for options already managed by this sync)
  const managedByRef = new Map(
    allOptions
      .filter((opt) => opt.reference_origin === REFERENCE_ORIGIN)
      .map((opt) => [opt.reference, opt])
  )

  // Lookup by name (for merging pre-existing options)
  const allByName = new Map(allOptions.map((opt) => [opt.name, opt]))

  const incomingKeys = new Set(media.map((item) => item._key))

  // 2. Create, update, or merge
  for (const item of media) {
    // a) Already managed — matched by reference (_key)
    const managed = managedByRef.get(item._key)
    if (managed) {
      const nameChanged = managed.name !== item.label
      const priceChanged = managed.metadata?.price_amount_cents !== item.value

      if (nameChanged || priceChanged) {
        try {
          await cl.sku_options.update({
            id: managed.id,
            name: item.label,
            price_amount_cents: 0,
            metadata: {
              price_amount_cents: item.value,
            },
            sku_code_regex: '', // empty string matches all SKUs
          })
          result.updated++
        } catch (e) {
          result.errors.push(
            `Failed to update sku_option ${managed.id} (${
              item.label
            }): ${clErrorMessage(e)}`
          )
        }
      }
      continue
    }

    // b) Merge — existing sku_option with same name but different origin
    const nameMatch = allByName.get(item.label)
    if (nameMatch) {
      try {
        await cl.sku_options.update({
          id: nameMatch.id,
          reference: item._key,
          reference_origin: REFERENCE_ORIGIN,
          price_amount_cents: 0,
          metadata: {
            price_amount_cents: item.value,
          },
          sku_code_regex: '', // empty string matches all SKUs
        })
        // Track it as managed so orphan cleanup won't miss it
        managedByRef.set(item._key, { ...nameMatch, reference: item._key })
        result.updated++
        console.log(
          `[sync-settings] Merged existing sku_option "${nameMatch.name}" (${nameMatch.id}) → reference: ${item._key}`
        )
      } catch (e) {
        result.errors.push(
          `Failed to merge sku_option ${nameMatch.id} (${
            item.label
          }): ${clErrorMessage(e)}`
        )
      }
      continue
    }

    // c) Create new
    try {
      await cl.sku_options.create({
        name: item.label,
        currency_code: CURRENCY_CODE,
        price_amount_cents: 0,
        metadata: {
          price_amount_cents: item.value,
        },
        reference: item._key,
        reference_origin: REFERENCE_ORIGIN,
        sku_code_regex: '', // empty string matches all SKUs
      })
      result.created++
    } catch (e) {
      result.errors.push(
        `Failed to create sku_option for "${item.label}": ${clErrorMessage(e)}`
      )
    }
  }

  // 3. Delete orphans (managed by this sync but no longer in Sanity)
  for (const [ref, opt] of managedByRef) {
    if (!incomingKeys.has(ref)) {
      try {
        await cl.sku_options.delete(opt.id)
        result.deleted++
      } catch (e) {
        result.errors.push(
          `Failed to delete orphaned sku_option ${opt.id} (${
            opt.name
          }): ${clErrorMessage(e)}`
        )
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Handler registry — add new field sync functions here
// ---------------------------------------------------------------------------

type FieldSyncHandler = {
  key: keyof SettingsWebhookBody
  handler: (
    data: any,
    cl: ReturnType<typeof CommerceLayer>
  ) => Promise<SyncResult>
}

const fieldHandlers: FieldSyncHandler[] = [
  { key: 'media', handler: syncMedia },
  // Future: { key: 'sizes', handler: syncSizes },
]

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<SettingsWebhookBody>(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    )

    if (!isValidSignature) {
      return new Response('Invalid Signature', { status: 401 })
    }

    if (!body || body._type !== 'settings') {
      return NextResponse.json({
        status: 400,
        success: false,
        now: Date.now(),
        message: 'Expected a settings document',
      })
    }

    // Authenticate with Commerce Layer
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
      endpoint: process.env.CL_ENDPOINT,
    })

    const cl = CommerceLayer({
      organization: process.env.CL_SLUG,
      accessToken: token.accessToken,
    })

    // Run each registered field handler if its data is present
    const results: Record<string, SyncResult> = {}

    for (const { key, handler } of fieldHandlers) {
      const data = body[key]
      if (Array.isArray(data) && data.length > 0) {
        results[key] = await handler(data, cl)
      }
    }

    const hasErrors = Object.values(results).some((r) => r.errors.length > 0)

    console.log('[sync-settings] Sync complete:', results)

    return NextResponse.json({
      status: hasErrors ? 207 : 200,
      success: !hasErrors,
      now: Date.now(),
      results,
    })
  } catch (error) {
    console.error('[sync-settings] Error:', error)
    return NextResponse.json({
      status: 500,
      success: false,
      now: Date.now(),
      message: error instanceof Error ? error.message : 'Internal server error',
    })
  }
}
