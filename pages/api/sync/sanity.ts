import sanityClient from '@sanity/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenTypeAPI from '../../../lib/api/OpenTypeAPI.js'
import Sanity from '../../../lib/api/Sanity'

// writing to sanity client
// what's the incoming data?

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // await OpenTypeAPI.getInstance(context)

  const sanity = new Sanity()

  console.log('Webhook payload:', req.body);

  // Initiate Sanity transaction to perform the following chained mutations
  let sanityTransaction = sanity.transaction()

  const title = 'font title' // comes from payload
  const id = 'kjnagkl98298ha'

  // Define product objects
  const modelId = `product-${id}`;
  const product = {
    _type: 'product',
    _id: modelId,
  }

  // Define product fields
  const productFields = {
    title,
    // UUID,
    // etc.
  }

  /*  ------------------------------ */
  /*  Begin Sanity Product Sync
  /*  ------------------------------ */

  console.log('Writing product to Sanity...')

  sanityTransaction = sanityTransaction.createIfNotExists(product)

  // Patch (update) product document with core commerce data
  sanityTransaction = sanityTransaction.patch(modelId, (patch) => patch.set(productFields))

  const result = await sanityTransaction.commit();

  console.info('Sync complete!');
  console.log('Result', result);

  res.statusCode = 200;
  res.json(JSON.stringify(result));

}

