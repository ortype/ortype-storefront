import { apiClient } from 'lib/sanity.client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getFonts, maybeUpsert } from '../../../lib/api/font'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Webhook payload:', req.body)

  /*  ------------------------------ */
  /*  Begin Sanity Font Sync
  /*  ------------------------------ */

  // // Variant duplicate warning
  // const variantNames = fonts.flatMap(({ variants }) =>
  //   variants.map(({ name }) => name)
  // )
  // const duplicates = variantNames.filter(
  //   (item, index) => variantNames.indexOf(item) !== index
  // )
  // console.log(`We have variant dups: ${duplicates.length > 0}`)

  try {
    const debug = false
    if (debug && req.query?.reset === 'legit'){
      // await deleteAllFonts()
      // await deleteAllVariants()
      const fontVariants = await apiClient.fetch(`*[_type == "fontVariant"] { _id, name }`);
      const fonts = await apiClient.fetch(`*[_type == "font"] { variants[]->{ _id } }`);

      // Extract referenced fontVariant IDs
      const referencedFontVariantIds = fonts.flatMap(font => font.variants).map(variant => variant._id);

      // Filter out fontVariant documents that are referenced
      const unreferencedFontVariants = fontVariants.filter(variant => !referencedFontVariantIds.includes(variant._id));

      // Perform the delete operation for unreferenced fontVariants
      for (const variant of unreferencedFontVariants) {
        // await apiClient.delete(variant._id);
        console.log(`Deleted ${variant._id} ${variant.name}`);
      }
    }
    for (const font of await getFonts()) {
      if (debug && font.name.includes('Lemm')) {
        await maybeUpsert(font, true)
      }
      if (!debug) {
        await maybeUpsert(font)
      }
    }
    return res.status(200).json({ message: 'Successful' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error,
    })
  }
}
