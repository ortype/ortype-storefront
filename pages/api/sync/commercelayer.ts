import type { NextApiRequest, NextApiResponse } from 'next'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer, {
  Market,
  PriceListCreate,
  SkuCreate,
  SkuOptionCreate,
  SkuOptionUpdate,
  SkuUpdate,
} from '@commercelayer/sdk'
import settings from '../../../lib/settings.js'

import { type FontVariant } from 'lib/sanity.queries'

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    _id: string
    name: string
    description: string
    variants: FontVariant[]
  }
}

let buffer = 0

export default async function sync(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  try {
    // @TODO: for security
    // https://medium.com/@fibonacid/syncing-contacts-between-sanity-and-active-campaign-2d42f1184a70
    // const secret = process.env.SANITY_WEBHOOK_SECRET;

    const token = await getIntegrationToken({
      clientId: process.env.CL_SYNC_CLIENT_ID,
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
      endpoint: process.env.CL_ENDPOINT,
    })

    // console.log('My access token: ', token.accessToken)
    // console.log('Expiration date: ', token.expires)

    const cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken: token.accessToken,
    })

    // console.log('cl: ', cl)
    console.log('req:', req.method, req.body)

    // create/update/delete SKUs
    // @TODO: How do we know if it is an create, update, or delete action?
    // One idea would be to create multiple webhooks with different POST, PATCH, DELETE
    // HTTP methods (https://www.sanity.io/docs/webhooks#ead6bd6003d5)
    // CREATE

    const virtualShippingCategories = await cl.shipping_categories.list({
      filters: { name_eq: 'Virtual' },
    })
    const merchShippingCategories = await cl.shipping_categories.list({
      filters: { name_eq: 'Merchandising' },
    })
    const VIRTUAL = virtualShippingCategories.shift()
    const MERCH = merchShippingCategories.shift()
    const get_sku_id = async (code) => {
      const response = await cl.skus.list({ filters: { code_eq: code } })
      return response.shift().id
    }
    const get_market_id = async () => {
      const markets = await cl.markets.list({
        filters: {
          name_eq: 'Global',
        },
      })
      return markets.shift().id
    }

    switch (req.method) {
      case 'PUT':
        console.log('CREATE!')
        // selects the shipping category (it's a required relationship for the SKU resource)
        const shippingCategories = await cl.shipping_categories.list({
          filters: { name_eq: 'Merchandising' },
        })
        const attributes = {
          code: req.body._id,
          name: req.body.name,
          reference_origin: 'SANITY',
          do_not_ship: true,
          do_not_track: true,
          // description: req.body.description || '',
          shipping_category: cl.shipping_categories.relationship(
            shippingCategories[0].id
          ), // assigns the relationship
        }

        // POST to `${process.env.CL_ENDPOINT}/api/skus`
        // To create a new SKU, send a POST request to the /api/skus endpoint, passing the resource arguments in the request body
        // or use the SDK, ahah!
        const newSku = await cl.skus.create(attributes)
        return res.status(200).json({ message: 'Successful', data: newSku })

      // UPDATE
      case 'PATCH':
        console.log('UPDATE!')
        for (const variant of req.body.variants) {
          const sku_id = await get_sku_id(variant._id)
          if (sku_id) {
            await cl.skus.update(<SkuUpdate>{
              id: sku_id,
              code: variant._id,
              name: variant.name,
              shipping_category: VIRTUAL,
            })
          } else {
            await cl.skus.create(<SkuCreate>{
              code: variant._id,
              name: variant.name,
              shipping_category: VIRTUAL,
            })
          }
          for (const option of settings.sku_options) {
            const options = await cl.sku_options.list({
              filters: { reference_eq: variant._id + '-' + option.reference },
            })
            if (!!options.length) {
              await cl.sku_options.update(<SkuOptionUpdate>{
                id: options.shift().id,
                currency_code: settings.currency,
                reference: variant._id + '-' + option.reference,
                name: variant.name + ' ' + option.name,
                sku_code_regex: variant._id,
                reference_origin: option.reference_origin,
                price_amount_cents: option.price,
              })
            } else {
              await cl.sku_options.create(<SkuOptionCreate>{
                currency_code: settings.currency,
                name: variant.name + ' ' + option.name,
                sku_code_regex: variant._id,
                reference: variant._id + '-' + option.reference,
                reference_origin: option.reference_origin,
                price_amount_cents: option.price,
              })
            }
          }
        }
        return res.status(200).json({ message: 'Successful', data: {} })

      // DELETE
      // @TODO: Looks like Deleting in Sanity Studio sends a "UPDATE" not "DELETE"
      // or my webhook was just mis-configured
      case 'DELETE':
        console.log('DELETE!')
        const deleteSkus = await cl.skus.list({
          filters: { code_eq: req.body._id },
        })
        console.log('deleteSkus: ', deleteSkus)
        // wait ok, so deleting is also by ID which we can only fetch
        const deletedSku = await cl.skus.delete(deleteSkus[0].id)
        return res.status(200).json({ message: 'Successful', data: deletedSku })
      default:
        return res.status(405).end(`${req.method} Not Allowed`)
    }
  } catch (error) {
    return res.status(500).json({
      error,
    })
  }

  // https://docs.commercelayer.io/core/v/api-reference/skus/create
  // On success, the API responds with a 201 Created status code

  // @TODO: consider checking idempotency-key
  // https://www.sanity.io/docs/webhooks#3e9b7dac38b7
}
