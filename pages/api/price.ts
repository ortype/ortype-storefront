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

interface Type {
  key: string
  label: string
  basePrice: number | string
}

interface Size {
  key: string
  label: string
  modifier: number
}

const types: Type[] = [
  {
    key: 'print',
    label: 'Desktop / Print',
    basePrice: 9000,
  },
  {
    key: 'web',
    label: 'Web',
    basePrice: '13000',
  },
  {
    key: 'app',
    label: 'App/Game',
    basePrice: '18000',
  },
]

const sizes: Size[] = [
  {
    key: 'small',
    label: 'Small (1-5 employees)',
    modifier: 1,
  },
  {
    key: 'medium',
    label: 'Medium (6-50 employees)',
    modifier: 2,
  },
  {
    key: 'large',
    label: 'Large (51-100 employees)',
    modifier: 3,
  },
  {
    key: 'xlarge',
    label: 'XLarge (101+ employees)',
    modifier: 4,
  },
  {
    key: 'student',
    label: 'Student',
    modifier: 0.5,
  },
  {
    key: 'non-profit',
    label: 'Non-Profit Organisation',
    modifier: 0.75,
  },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PriceCalculationResponse>
) {
  console.log('price API route')

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

    // const includedOrder = included?.find((item) => item.type === 'orders')
    // const orderMetadata = includedOrder?.attributes?.metadata
    // console.log('orderMetadata: ', orderMetadata)

    // @TODO: use sku_code to look up sanity fontVariant by id

    // console.log('line item metadata: ', metadata)
    // iterate over the types in the metadata.license?.types
    // use their base price and multiply with the size.modifier

    const size = sizes.find(({ key }) => key === metadata.license.size)
    const selectedTypes = types.filter(({ key }) =>
      metadata.license.types.find((val) => val === key)
    )
    const total = selectedTypes.reduce((acc, { key, basePrice }) => {
      return acc + Number(basePrice) * size.modifier
    }, 0)

    const data = {
      sku_code,
      unit_amount_cents: total,
    }

    console.log('price API route: ', data)

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
