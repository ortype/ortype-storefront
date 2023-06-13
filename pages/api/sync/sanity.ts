import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import {
  apiClient,
  findByUidAndVersion,
  findFontVariantByUidAndVersion,
  findVariantByUid,
  getAllFonts,
  getAllFontVariants,
  findByUid,
  findByParentUid,
} from 'lib/sanity.client'
import slugify from 'slugify'
import font from '../../../schemas/font/font'

async function deleteAllFonts() {
  // Without params
  return await apiClient
    .delete({ query: '*[_type == "font"][0...999]' })
    .then(() => {
      console.log('The documents matching *[_type == "font"] were deleted')
    })
    .catch((err) => {
      console.error('Delete failed: ', err.message)
    })
}

async function deleteAllVariants() {
  // Without params
  return await apiClient
    .delete({ query: '*[_type == "fontVariant"][0...999]' })
    .then(() => {
      console.log(
        'The documents matching *[_type == "fontVariant"] were deleted'
      )
    })
    .catch((err) => {
      console.error('Delete failed: ', err.message)
    })
}

// maybe check nesting for hash
const hash = (obj) => {
  const ordered = Object.keys(obj)
    .sort()
    .reduce((obj, key) => {
      obj[key] = obj[key]
      return obj
    }, {})
  const serialized = JSON.stringify(ordered)
  return cyrb53(serialized)
}
const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

async function buildFontDocument(font, sanityFont) {
  // This UID lookup ALSO prevents multiple font documents from being created
  if (sanityFont && sanityFont._id) {
    font._id = sanityFont._id // reset the ID
  }
  font.variants = [] // font object has a variants array which we need to replace with an array of refs
  return font
}

async function buildVariantDocument(sanityFontVariant, fontVariant) {
  if (sanityFontVariant && sanityFontVariant._id) {
    fontVariant._id = sanityFontVariant._id // reset the ID
  }
  return fontVariant
}

async function createOrUpdateFonts(fonts) {
  /*
  // @TODO: This update draft pattern relies on the _id coming from the API
  // to match the _id that is set in the font document, but we reset that ID below
  // Extract draft document IDs from current update
  const draftDocumentUids = fonts.map((font) => {
    return `drafts.${font._id}`;
  })

  // Determine if drafts exist for any updated products
  const existingDrafts = await apiClient.fetch(`*[_id in $ids]._id`, {
    ids: draftDocumentUids,
  }) 
  */

  for (const font of fonts) {
    const transaction = apiClient.transaction()
    const sanityFont = await findByUidAndVersion(font.uid, font.version)
    // @TODO: move to a `hash` method in fonts API e.g. in the `shouldUpdate` where we read from the font file itself
    // @NOTE: it seems the hashing does not detect differences in the new slug.current

    console.log('retrieved', sanityFont.slug)
    // if (hash(font) === sanityFont.hash) {
    //   console.log('already up to date', font.name)
    //   continue
    // }
    // font.hash = hash(font)

    // Order the variants array
    let orderedVariants = font.variants.sort((a, b) => a.index - b.index)
    const sanityFontVariants = await getAllFontVariants()
    console.log(`Got existing variants [${sanityFontVariants.length}]`)
    for (const variant of orderedVariants) {
      // Find all Sanity Variants and select the first match by uid
      const sanityFontVariant = sanityFontVariants.find(
        (v) => v.uid === variant.uid
      )
      const variantDoc = await buildVariantDocument(sanityFontVariant, variant)
      console.log(`variantDoc: ${variantDoc._id} ${variantDoc.name}`)
      transaction
        .createIfNotExists(variantDoc)
        .patch(variantDoc._id, (patch) => patch.set(variantDoc))
    }

    // Build Sanity product document
    const fontDoc = await buildFontDocument(font, sanityFont)
    // console.log(`fontDoc: ${fontDoc._id} ${fontDoc.name}`)
    // const draftId = `drafts.${fontDoc._id}`

    const merge_variants = orderedVariants.map((variant) => ({
      _type: 'reference',
      _weak: true,
      _ref: variant._id,
      _key: variant._id,
    }))
    // this shoudl work in theory
    // if (sanityFont) {
    //   for (const sanityVariant of sanityFont.variants) {
    //     if (!merge_variants.find(v => v._key == sanityVariant._id)){
    //       merge_variants.push(sanityVariant)
    //     }
    //   }
    //   console.log(merge_variants, merge_variants.length)
    // }
    // Create (or update) existing published fontDoc
    transaction
      .createIfNotExists(fontDoc)
      .patch(fontDoc._id, (patch) => patch.set(fontDoc))
      .patch(fontDoc._id, (patch) =>
        patch.set({
          variants: merge_variants,
        })
      )
    const result = await transaction.commit({ dryRun: true })
    console.log('commit')
    // @TODO: update drafts as well.
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // For testing purposes only
  // await deleteAllFonts()
  // await deleteAllVariants()
  // return res.status(200).json({ message: 'Successful' })

  console.log('Webhook payload:', req.body)
  const OpenType = await OpenTypeAPI.getInstance()

  /*  ------------------------------ */
  /*  Begin Sanity Font Sync
  /*  ------------------------------ */

  let fonts = []
  for (const font of await OpenType.getFonts()) {
    fonts.push(await font.getFontProductData(false))
  }
  fonts = fonts.filter(f => f.name == 'La Pontaise')

  // Variant duplicate warning
  const variantNames = fonts.flatMap(({ variants }) =>
    variants.map(({ name }) => name)
  )
  const duplicates = variantNames.filter(
    (item, index) => variantNames.indexOf(item) !== index
  )
  console.log(`We have variant dups: ${duplicates.length > 0}`)

  try {
    await createOrUpdateFonts(fonts)
    return res.status(200).json({ message: 'Successful' })
  } catch (error) {
    return res.status(500).json({
      error,
    })
  }
}
