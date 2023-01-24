import type { NextApiRequest, NextApiResponse } from 'next'
import { nanoid } from 'nanoid'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import Sanity from '../../../lib/api/Sanity'
import slugify from 'slugify'

// writing to sanity client
// what's the incoming data?

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {


  const sanity = new Sanity()

  console.log('Webhook payload:', req.body)

  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = sanity.transaction()

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
  const OpenType = await OpenTypeAPI.getInstance()
  console.log(await OpenType.getFonts())
  for (const font of await OpenType.getFonts()) {
    const dataObject = {
      _id: nanoid(),
      _type: 'product',
      name: font.familyName,
      slug: { current: slugify(font.familyName) },
      uid: font.getUid(),
      version: font.version
    }
    const product = await sanity.findByUidAndVersion(font.getUid(), font.version)
    if (product) {
      dataObject['_id'] = product['_id']
    }
    sanity.createOrReplace(dataObject)
    break
  }

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')

  // sanityTransaction = sanityTransaction.createIfNotExists(product)
  //
  // // Patch (update) product document with core commerce data
  // sanityTransaction = sanityTransaction.patch(_id, (patch) => patch.set(productFields))
  //
  // const result = await sanityTransaction.commit();

  // console.info('Sync complete!');
  // console.log('Result', result);

  res.statusCode = 200
  res.json({})

}

