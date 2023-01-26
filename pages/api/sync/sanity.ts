import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import { apiClient, findByUidAndVersion, findVariantByUid, getAllFonts, getAllFontVariants, findByUid, findByParentUid } from 'lib/sanity.client'
import slugify from 'slugify'

// writing to sanity

async function createOrReplaceFonts(fonts) {
  for (const font of fonts) {
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
    .delete({query: '*[_type == "font"][0...999]'})
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
    .delete({query: '*[_type == "fontVariant"][0...999]'})
    .then(() => {
      console.log('The documents matching *[_type == "fontVariant"] were deleted')
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
    const sanityFontVariant = fontVariants.find(v => v.uid === variant.uid)
    if (sanityFontVariant && sanityFontVariant._id) {
      variant._id = sanityFontVariant._id // reset the ID
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
      console.log(`Found font variants for: ${font.uid} [${fontVariants.length}]`)
      // order fonts by the index from their fVar table
      const ordered = fontVariants.sort((a,b) => a.index - b.index)
      // 3 - for each font, add its matching variants in the fontVariants array
      let tx = apiClient.transaction()
      tx = tx.patch(font._id, patch => patch.set({
        'variants': ordered.map(variant => ({
          _type: 'reference',
          _weak: true,
          _ref: variant._id,
          _key: variant._id
        }))
      }))

      console.log(`Adding variant references to ${font.uid} in Sanity`);
      const result = await tx.commit({ dryRun: false })
      console.log('Result', result)
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // For testing purposes only
  // await deleteFonts()
  // await deleteVariants()

  console.log('Webhook payload:', req.body)
  const OpenType = await OpenTypeAPI.getInstance()

  /*  ------------------------------ */
  /*  Begin Sanity Font Sync
  /*  ------------------------------ */

  const modifiedFonts = []
  for (const font of await OpenType.getFonts()) {
    modifiedFonts.push(...(await font.getReactionProducts(false)))
  }
  const parentFonts = modifiedFonts.filter(item => item._type === 'font');
  const fontVariants = modifiedFonts.filter(item => item._type === 'fontVariant');

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
  res.statusCode = 200
  res.json({ message: 'Successful' })
}

