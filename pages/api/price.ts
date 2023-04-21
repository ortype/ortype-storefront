import { NextApiRequest, NextApiResponse } from 'next'
import CommerceLayer, { Order } from '@commercelayer/sdk'
import { getIntegrationToken } from '@commercelayer/js-auth'

type PriceCalculationRequest = {
  data: {
    attributes: {
      sku_code: string
      unit_amount_cents: number
      quantity: number
    }
    relationships: {
      order: Order
    }
  }
}

type PriceCalculationResponse = {
  totalPrice: number
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceCalculationResponse>
) {
  console.log('price API route req.body: ', req.body)

  const {
    data: {
      attributes: { quantity, sku_code, unit_amount_cents },
      relationships: { order },
    },
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

    /*
    const price = await cl.prices.calculate({
      quantity,
      sku_code,
      country: 'DE', // replace with the appropriate country code
      currency: 'EUR', // replace with the appropriate currency code
    })
    */

    // const totalPrice = price.amount_cents / 100

    console.log('order relationship: ', order, order.metadata)

    const data = {
      sku_code,
      unit_amount_cents: 13000,
      metadata: {},
    }

    console.log('price API route: ', data)

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
