import type { NextApiRequest, NextApiResponse } from 'next'
import { getSkuObject, jsonImport } from '../../../lib/api/commercelayer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!req.body.variants)
      return res.status(405).end(`Payload is missing variants`)
    console.log(req.body)
    const inputs = await Promise.all(req.body.variants.map(variant => getSkuObject(variant)))
    await jsonImport('skus', inputs)
    return res.status(200).json({ message: 'Successful' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error
    })
  }
}
