import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import { client, findByUidAndVersion } from 'lib/sanity.write'
import slugify from 'slugify'

// writing to sanity client
// what's the incoming data?

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  console.log('Webhook payload:', req.body)
  const OpenType = await OpenTypeAPI.getInstance()

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  for (const font of await OpenType.getFonts()) {

    // @TODO: we may have multiple parent font files within the root of a font family folder (e.g. Regular & Italic)

    const dataObject = {
      _id: nanoid(),
      _type: 'product',
      name: font.familyName,
      slug: { current: slugify(font.familyName, { lower: true }) },
      uid: font.getUid(),
      version: font.version
    }
    const product = await findByUidAndVersion(font.getUid(), font.version)
    if (product && product._id) {
      console.log('we got a product: ', product._id)
      dataObject._id = product._id
    }
    console.log('dataObject: ', dataObject)
    client.createOrReplace(dataObject)
  }

  /*
  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = client.transaction()

  const name = 'font title' // comes from payload

  // Define product objects
  const _id = nanoid()
  const product = {
    _type: 'product',
    _id
  }

  // Define product fields
  const productFields = {
    name
    // UUID,
    // etc.
  }

  console.log('Writing product to Sanity...')

  sanityTransaction = sanityTransaction.createIfNotExists(product)

  // Patch (update) product document with core commerce data
  sanityTransaction = sanityTransaction.patch(_id, (patch) => patch.set(productFields))
  const result = await sanityTransaction.commit();

  console.info('Sync complete!');
  console.log('Result', result);

  */

  res.statusCode = 200
  res.json({ message: 'Successful' })

}

