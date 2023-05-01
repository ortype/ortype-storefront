import type { NextApiRequest, NextApiResponse } from 'next'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer, {
  Market,
  PriceListCreate,
  SkuCreate,
  SkuOptionCreate,
  SkuOptionUpdate,
  SkuUpdate,
  Sku,
  AttachmentCreate,
  AttachmentUpdate,
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
    console.log(
      'req:',
      req.method
      // req.body
    )

    // return res.status(200).json({ message: 'Successful', data: {} })

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
    const get_market_id = async () => {
      const markets = await cl.markets.list({
        filters: {
          name_eq: 'Global',
        },
      })
      return markets.shift().id
    }

    const getSkuId = async (code) => {
      const response = await cl.skus.list({ filters: { code_eq: code } })
      return response.shift()?.id
    }

    const getAttachmentId = async (reference) => {
      const response = await cl.attachments.list({
        filters: { reference_eq: reference },
      })
      return response.shift()?.id
    }

    async function getAttachments(metafields, sku) {
      const files = metafields.filter(
        ({ key, value }) =>
          key === 'otf' ||
          key === 'woff' ||
          key === 'woff2' ||
          key === 'familyFile'
      )
      const skuAttachments = []
      for (const file of files) {
        const reference = `${sku.code}-${file.key}`
        const attachmentId = await getAttachmentId(reference)
        if (attachmentId) {
          skuAttachments.push(
            await cl.attachments.update(<AttachmentUpdate>{
              id: attachmentId,
              name: file.key,
              url: file.value,
              reference,
              attachable: sku,
            })
          )
        } else {
          skuAttachments.push(
            await cl.attachments.create(<AttachmentCreate>{
              name: file.key,
              url: file.value,
              reference,
              attachable: sku,
            })
          )
        }
      }
      return skuAttachments
    }

    async function updateOrCreateSkus(variants) {
      const updatedSkus = []
      for (const variant of variants) {
        const skuId = await getSkuId(variant._id)
        if (skuId) {
          const updatedSku = await cl.skus.update(<SkuUpdate>{
            id: skuId,
            code: variant._id,
            name: variant.name,
            reference: variant.uid,
            reference_origin: variant.parentUid,
          })
          await getAttachments(variant.metafields, updatedSku)
          updatedSkus.push(updatedSku)
        } else {
          const createdSku = await cl.skus.create(<SkuCreate>{
            code: variant._id,
            name: variant.name,
            shipping_category: VIRTUAL,
            reference: variant.uid,
            reference_origin: variant.parentUid,
            do_not_ship: true,
            do_not_track: true,
          })
          await getAttachments(variant.metafields, createdSku)
          updatedSkus.push(createdSku)
        }
      }
      return updatedSkus
    }

    switch (req.method) {
      case 'PUT':
        console.log('CREATE!')
        let newSku = {}
        // selects the shipping category (it's a required relationship for the SKU resource)
        /*
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
        newSku = await cl.skus.create(attributes)
        */
        return res.status(200).json({ message: 'Successful', data: newSku })
      // UPDATE
      case 'PATCH':
        console.log(
          `UPDATE: ${req.body.uid}: ${req.body.variants?.map(
            (variant) => variant.name
          )}`
        )
        /*
        console.log(
          'Metafields: ',
          req.body.variants.map(({ metafields }) =>
            metafields.map(({ key, value }) => `${key}: ${value}`)
          )
        )
        */

        if (!req.body.variants)
          return res.status(405).end(`Payload is missing variants`)
        const updatedSkus = []

        try {
          const updatedSkus = await updateOrCreateSkus(req.body.variants)
          return res
            .status(200)
            .json({ message: 'Successful', data: updatedSkus })
        } catch (error) {
          console.error(error)
          return res.status(500).json({ message: 'Internal server error' })
        }

      /*
        const allSkus = await cl.skus.list({ filters: { reference_origin_eq: req.body.uid }})
        console.log(`all SKUs from ${req.body.name}: ${allSkus.map(sku => sku.name)}`)
        // if skus ARE present in allSkus which ARE NOT present in variants they should be deleted. Compare allSkus with req.body.variants by sku.code === variant._id
        const filtered = allSkus.filter(({code}) => !req.body.variants.some(({_id}) => _id === code))
        if (filtered.length > 0) {
          console.log(`Filter results: ${filtered.map(item => item.name)}`)
          for (const item of filtered) {
            updatedSkus.push(await cl.skus.delete(item.id))
          }
        }
        */

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
