import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import slugify from 'slugify'

let shippingCategory = undefined
let market = undefined
const skuLookup = {}

const token = await authenticate('client_credentials', {
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
  // console.log(shippingCategory)
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
  try {
    const importObject = await cl.imports.create({
      resource_type,
      inputs,
    })
    if (importObject.errors_count) {
      console.error('Import Errors', importObject.errors_count)
    }
    return importObject
  } catch (e) {
    console.log('jsonImport error ', e)
    return e
  }
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

/* ------------------------------------------------------------------ */
/*  Group SKU generation                                               */
/* ------------------------------------------------------------------ */

interface GroupSkuVariant {
  _id: string
  optionName?: string | null
  name?: string | null
}

interface GroupSkuFontInput {
  _id: string
  uid: string
  name: string
  shortName?: string | null
  styleGroups?: Array<{
    groupName?: string | null
    variants?: GroupSkuVariant[] | null
    italicVariants?: GroupSkuVariant[] | null
  }> | null
  variants?: GroupSkuVariant[] | null
}

/**
 * Generate CL SKU import objects for each resolved style group of a font.
 * If the font has explicit `styleGroups`, one group SKU per group.
 * Otherwise a single default "Standard" group containing all variants.
 */
export async function getGroupSkuObjects(font: GroupSkuFontInput) {
  const shipping_category_id = await getShippingCategoryId()

  type ResolvedGroup = {
    groupName: string
    groupSlug: string
    includedVariants: Array<{ _id: string; displayName: string }>
  }

  const groups: ResolvedGroup[] = []

  if (font.styleGroups?.length) {
    for (const sg of font.styleGroups) {
      const groupName = sg.groupName || 'Standard'
      const groupSlug = slugify(groupName, { lower: true })
      const variants = sg.variants || []
      const italicVariants = sg.italicVariants || []
      const maxLen = Math.max(variants.length, italicVariants.length)
      const merged: ResolvedGroup['includedVariants'] = []

      for (let i = 0; i < maxLen; i++) {
        if (i < variants.length && variants[i]) {
          merged.push({
            _id: variants[i]._id,
            displayName: variants[i].optionName || variants[i].name || variants[i]._id,
          })
        }
        if (i < italicVariants.length && italicVariants[i]) {
          merged.push({
            _id: italicVariants[i]._id,
            displayName:
              italicVariants[i].optionName || italicVariants[i].name || italicVariants[i]._id,
          })
        }
      }

      groups.push({ groupName, groupSlug, includedVariants: merged })
    }
  } else if (font.variants?.length) {
    // Default Standard group containing all font variants
    const included = font.variants
      .filter((v): v is GroupSkuVariant => v != null)
      .map((v) => ({
        _id: v._id,
        displayName: v.optionName || v.name || v._id,
      }))
    groups.push({ groupName: 'Standard', groupSlug: 'standard', includedVariants: included })
  }

  return groups.map((g) => ({
    code: `${font._id}--group--${g.groupSlug}`,
    name: `${font.shortName || font.name} ${g.groupName}`,
    shipping_category_id,
    reference: `${font.uid}:group:${g.groupSlug}`,
    reference_origin: font.uid,
    do_not_ship: true,
    do_not_track: true,
    metadata: {
      projectionType: 'group',
      parentUid: font.uid,
      groupName: g.groupName,
      groupSlug: g.groupSlug,
      includedSkuCodes: g.includedVariants.map((v) => v._id),
      includedStyleNames: g.includedVariants.map((v) => v.displayName),
    },
  }))
}
