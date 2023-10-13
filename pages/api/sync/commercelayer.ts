import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer, {
  AttachmentCreate,
  AttachmentUpdate,
  Market,
  PriceListCreate,
  Sku,
  SkuCreate,
  SkuOptionCreate,
  SkuOptionUpdate,
  SkuUpdate,
} from '@commercelayer/sdk'
import type { NextApiRequest, NextApiResponse } from 'next'
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

const deliveredIds = new Set<string>()

export default async function sync(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  // Check if the "x-secret" header is present in the request
  // Check if the secret matches the expected value
  if (
    !req.headers['x-secret'] ||
    req.headers['x-secret'] !== process.env.SANITY_WEBHOOK_SECRET
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('req:', req.headers, req.method)
  const idempotencyKey = req.headers['idempotency-key'] as string

  if (deliveredIds.has(idempotencyKey)) {
    console.log(
      `Delivery with idempotency key ${idempotencyKey} already received, ignoring...`
    )
    res.status(200).end()
    return
  }

  console.log(`Received delivery with idempotency key ${idempotencyKey}`)
  deliveredIds.add(idempotencyKey)

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
    // return res.status(200).json({ message: 'Successful!!!', data: {} })

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

    const getSkusByUid = async (uid) => {
      return await cl.skus.list({ filters: { reference_origin_eq: uid } })
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
        // add a delay of 1 second between loops
        // there are 2 calls per loop and 4 loops
        // each sku will take at least 4 seconds to process with the delays
        console.log('Delay... 0.5 seconds')
        await new Promise((resolve) => setTimeout(resolve, 500))
        const reference = `${sku.code}-${file.key}`
        const attachmentId = await getAttachmentId(reference)
        console.log('Attachment ID: ', attachmentId)
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
      console.log('skuAttachments: ', skuAttachments)
      return skuAttachments
    }

    async function updateOrCreateSkus(uid, variants) {
      const updatedSkus = []
      // const skusByUid = await getSkusByUid(uid)
      // console.log('skusByUid count: ', skusByUid?.length, uid)
      // skusByUid count:  Rather v2 72 10
      // and "Rather v2" only finds 10 SKUs... I wonder if its paginated??
      // ah yes, its paginated https://docs.commercelayer.io/core/pagination
      // max page size is 25... so we would have to loop through this to get all
      // also, the the process drops for some reason, we don't enter the variants for loop

      for (const variant of variants) {
        const skuId = await getSkuId(variant._id)
        // console.log('Find SKU by code: ', code)
        // const sku = skusByUid.find(({ code }) => code === variant._id)
        if (skuId) {
          console.log('Found SKU... updating: ', skuId, variant.name)
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
          console.log('Creating SKU...: ', variant._id, variant.name)
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
      // UPDATE OR CREATE
      case 'PUT':
      case 'PATCH':
        if (!req.body.variants)
          return res.status(405).end(`Payload is missing variants`)
        const updatedSkus = []

        console.log(
          `CREATE/UPDATE: ${req.body.uid}: ${
            req.body.variants.length
          } SKUS: ${req.body.variants.map((variant) => variant.name)}`
        )

        try {
          const updatedSkus = await updateOrCreateSkus(
            req.body.uid,
            req.body.variants
          )
          console.log(
            `updatedSkus: ${updatedSkus.map(({ name }) => `${name}`)}`
          )
          return res
            .status(200)
            .json({ message: 'Successful', data: updatedSkus })
        } catch (error) {
          console.error(
            `Create/Update status: ${error.status} | errors: ${errors} `
          )
          return res.status(error.status).json({ message: errors })
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
}
