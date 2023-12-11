import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'

let shippingCategory = undefined
let market = undefined
const skuLookup = {}

const token = await getIntegrationToken({
  clientId: process.env.CL_SYNC_CLIENT_ID,
  clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
  endpoint: process.env.CL_ENDPOINT,
})

const cl = CommerceLayer({
  organization: process.env.CL_SLUG,
  accessToken: token.accessToken,
})

export async function getShippingCategory(fresh = false) {
  if (!shippingCategory || fresh) {
    const shippingCategories = await cl.shipping_categories.list({
      filters: { name_eq: 'Virtual' },
    })
    shippingCategory = shippingCategories.shift()
  }
  console.log(shippingCategory)
  return shippingCategory
}

export async function getShippingCategoryId(fresh = false) {
  return (await getShippingCategory(fresh))?.id
}

export async function getMarket(fresh = false) {
  if (!market || fresh) {
    const markets = await cl.markets.list({
      filters: {
        name_eq: 'Global',
      },
    })
    market = markets.shift()
  }
  return market
}

export async function getMarketId(fresh = false) {
  return (await getMarket(fresh))?.id
}

export async function lookupSkuId(code, fresh = false) {
  if (skuLookup[code]) {
    return skuLookup[code]
  }
  const skus = await cl.skus.list({ filters: { code_eq: code } })
  const id = skus.shift()?.id
  if (id) {
    skuLookup[code] = id
  }
  return skuLookup[code]
}

export async function jsonImport(resource_type, inputs) {
  const importObject = await cl.imports.create({
    resource_type,
    inputs,
  })
  if (importObject.errors_count) {
    console.error('Import Errors', importObject.errors_count)
  }
  return importObject
}

export async function getSkuObject(sanityVariant) {
  const shipping_category_id = await getShippingCategoryId()
  const files = sanityVariant.metafields
    .filter(
      ({ key, value }) =>
        key === 'otf' ||
        key === 'woff' ||
        key === 'woff2' ||
        key === 'familyFile'
    )
    .map((file) => ({ key: file.key, value: file.value }))
  return {
    code: sanityVariant._id,
    name: sanityVariant.name,
    shipping_category_id,
    reference: sanityVariant.uid,
    reference_origin: sanityVariant.parentUid,
    do_not_ship: true,
    do_not_track: true,
    metadata: files,
  }
}
