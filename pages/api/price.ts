import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { sizes } from 'lib/settings'
import { NextApiRequest, NextApiResponse } from 'next'

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
  // @TODO: consider including skus resource to pull sku_options from
  // and consider including the order resource to pull license size metadata from
  // although both of these data points we can access via the line_items metadata
  // and via the sku_options.list (although this isn't specific to the line_item, it works)
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceCalculationResponse>
) {
  // console.log('Price req.body: ', req.body)
  const {
    data: {
      attributes: { quantity, sku_code, unit_amount_cents, metadata },
    },
    // included,
  } = req.body as PriceCalculationRequest

  // shared secret: 110eedcdc3dc650fce5a7e4697ee768a
  // We recommend verifying the callback authenticity by signing the payload with that shared secret and comparing the result with the callback signature header.

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

    // const includedOrder = included?.find((item) => item.type === 'orders')
    // const orderMetadata = includedOrder?.attributes?.metadata
    // console.log('orderMetadata: ', orderMetadata)

    // @TODO: use sku_code to look up sanity fontVariant by id

    console.log(
      'line item metadata: ',
      metadata.license.size,
      metadata.license.types
    )
    // iterate over the types in the metadata.license?.types
    // use their base price and multiply with the size.modifier

    const size = sizes.find(
      ({ value }) => value === metadata.license.size.value
    )

    console.log('price: found size: ', size)

    const skuOptions = await cl.sku_options.list()

    const selectedTypes = skuOptions.filter(({ reference }) =>
      metadata.license.types.find((val) => val === reference)
    )
    console.log('skuOptions: ', skuOptions) // reference: '1-licenseType-desktop',
    console.log('selectedTypes: ', selectedTypes)
    const total = selectedTypes.reduce((acc, { price_amount_cents }) => {
      return acc + Number(price_amount_cents) * size.modifier
    }, 0)

    const data = {
      sku_code,
      unit_amount_cents: total,
    }

    console.log('Price API route data: ', data)

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' })
  }
}
