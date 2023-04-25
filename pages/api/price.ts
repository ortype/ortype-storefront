import { NextApiRequest, NextApiResponse } from 'next'
import CommerceLayer from '@commercelayer/sdk'
import { getIntegrationToken } from '@commercelayer/js-auth'

type PriceCalculationRequest = {
  data: {
    attributes: {
      sku_code: string
      unit_amount_cents: number
      quantity: number
      metadata: object
    }
  }
  // included: []
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

// @TODO: Hardcode license configuration data

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceCalculationResponse>
) {
  console.log('price API route req.body: ', req.body)

  const {
    data: {
      attributes: { quantity, sku_code, unit_amount_cents, metadata },
    },
    // included,
  } = req.body as PriceCalculationRequest

  try {
    const token = await getIntegrationToken({
      clientId: process.env.CL_SYNC_CLIENT_ID,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
      endpoint: process.env.CL_ENDPOINT,
    })

    const cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken: token.accessToken,
    })

    console.log('line item metadata: ', metadata)

    // const includedOrder = included?.find((item) => item.type === 'orders')
    // const orderMetadata = includedOrder?.attributes?.metadata
    // console.log('orderMetadata: ', orderMetadata)

    // @TODO: use sku_code to look up sanity fontVariant by id

    const data = {
      sku_code,
      unit_amount_cents: 13000,
    }

    console.log('price API route: ', data)

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
