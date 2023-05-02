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

// writing to sanity

async function createOrReplaceFonts(fonts) {
  for (const font of fonts) {
    const tmp = font
    delete tmp.hash
    if (hash(tmp) === font.hash) {
      console.log('upddd')
      return
    }
    font.hash = hash(font)
    const sanityFont = await findByUidAndVersion(font.uid, font.version)
    // This UID lookup ALSO prevents multiple font documents from being created
    if (sanityFont && sanityFont._id) {
      font._id = sanityFont._id // reset the ID
    }
    console.log('font: ', font._id, font.uid)
    await apiClient.createOrReplace(font)
  }
}

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

async function createOrReplaceVariants(variants) {
  console.log('Running createOrReplaceVariants')
  const fontVariants = await getAllFontVariants()
  // There are tons of variants, it makes more sense to request all of them, and do an array filter instead of a GROQ query for each one
  console.log(`Got existing variants [${fontVariants.length}]`)
  for (const variant of variants) {
    // The fonts already exist, so we can look them up by parentUid
    const sanityFontVariant = fontVariants.find((v) => v.uid === variant.uid)
    if (sanityFontVariant && sanityFontVariant._id) {
      variant._id = sanityFontVariant._id // reset the ID
      // this is meant to prevent duplicate variants documents from being create
      // however we seem to be getting doubles rather consistently
    }
    console.log('fontVariant: ', variant._id, variant.uid)
    await apiClient.createOrReplace(variant, { dryRun: false }) // create the variant
  }
}

async function createFontVariantRefs() {
  // 1 - find all fonts
  const fonts = await getAllFonts()

  // 2 - find their variants based on parentUid
  for (const font of fonts) {
    const fontVariants = await findByParentUid(font.uid)
    if (Array.isArray(fontVariants)) {
      console.log(
        `Found font variants for: ${font.uid} [${fontVariants.length}]`
      )
      // order fonts by the index from their fVar table
      const ordered = fontVariants.sort((a, b) => a.index - b.index)
      // 3 - for each font, add its matching variants in the fontVariants array
      let tx = apiClient.transaction()
      tx = tx.patch(font._id, (patch) =>
        patch.set({
          variants: ordered.map((variant) => ({
            _type: 'reference',
            _weak: true,
            _ref: variant._id,
            _key: variant._id,
          })),
        })
      )

      console.log(`Adding variant references to ${font.uid} in Sanity`)
      const result = await tx.commit({ dryRun: false })
      console.log('Result', result)
    }
  }
}

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

async function buildFontDocument(font) {
  const sanityFont = await findByUidAndVersion(font.uid, font.version)
  // This UID lookup ALSO prevents multiple font documents from being created
  if (sanityFont && sanityFont._id) {
    font._id = sanityFont._id // reset the ID
  }
  font.variants = [] // font object has a variants array which we need to replace with an array of refs
  return font
}

async function buildVariantDocument(fontVariant) {
  // @TODO: try single lookup again b/c
  // const fontVariants = await getAllFontVariants()
  const sanityFontVariant = await findFontVariantByUidAndVersion(
    fontVariant.uid,
    fontVariant.version
  )
  if (sanityFontVariant && sanityFontVariant._id) {
    fontVariant._id = sanityFontVariant._id // reset the ID
  }
  return fontVariant
}

async function createOrUpdateFonts(transaction, fonts) {
  for (const font of fonts) {
    // Build Sanity product document
    const orderedVariants = font.variants.sort((a, b) => a.index - b.index)
    for (const variant of orderedVariants) {
      const variantDoc = await buildVariantDocument(variant)
      // console.log(`variantDoc: ${variantDoc._id} ${variantDoc.name}`)
      transaction
        .createIfNotExists(variantDoc)
        .patch(variantDoc._id, (patch) => patch.set(variantDoc))
    }

    const fontDoc = await buildFontDocument(font)
    // console.log(`fontDoc: ${fontDoc._id} ${fontDoc.name}`)
    // const draftId = `drafts.${document._id}`

    // Create (or update) existing published fontDoc
    transaction
      .createIfNotExists(fontDoc)
      .patch(fontDoc._id, (patch) => patch.set(fontDoc))
      .patch(fontDoc._id, (patch) =>
        patch.set({
          variants: orderedVariants.map((variant) => ({
            _type: 'reference',
            _weak: true,
            _ref: variant._id,
            _key: variant._id,
          })),
        })
      )

    // @TODO: update drafts as well
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

  const fonts = []
  for (const font of await OpenType.getFonts()) {
    fonts.push(await font.getReactionProducts(false))
  }

  const variantNames = fonts.flatMap(({ variants }) =>
    variants.map(({ name }) => name)
  )
  const duplicates = variantNames.filter(
    (item, index) => variantNames.indexOf(item) !== index
  )

  console.log(`Dups: ${duplicates}`)

  return res.status(200).json({ message: 'Successful' })

  try {
    const transaction = apiClient.transaction()
    await createOrUpdateFonts(transaction, fonts)
    const result = await transaction.commit({ dryRun: false })
    console.log('Result', result)
    return res.status(200).json({ message: 'Successful' })
  } catch (error) {
    return res.status(500).json({
      error,
    })
  }

  // console.log('parentFonts: ', parentFonts)
  // console.log('fontVariants: ', fontVariants)

  if (parentFonts.length) {
    /*  ------------------------------ */
    /*  Create or replace font docs
    /*  ------------------------------ */

    await createOrReplaceFonts(parentFonts)
  }

  if (fontVariants.length) {
    /*  ------------------------------ */
    /*  Create or replace variant docs
    /*  ------------------------------ */
    await createOrReplaceVariants(fontVariants)

    /*  ------------------------------ */
    /*  Add font variants as refs
    /*  ------------------------------ */
    await createFontVariantRefs()
  }

  console.log('Successful')
  return res.status(200).json({ message: 'Successful' })
}
