import type { NextApiRequest, NextApiResponse } from 'next'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import {
  apiClient,
} from 'lib/sanity.client'

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
  // For testing purposes only
  // await deleteAllFonts()
  // await deleteAllVariants()
  // return res.status(200).json({ message: 'Successful' })

  console.log('Webhook payload:', req.body)
  const OpenType = await OpenTypeAPI.getInstance()

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
    for (const font of await OpenType.getFonts()) {
      await font.maybeUpsert()
    }
    return res.status(200).json({ message: 'Successful' })
  } catch (error) {
    return res.status(500).json({
      error,
    })
  }
}
