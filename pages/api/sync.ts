import type { NextApiRequest, NextApiResponse } from 'next'
import { getIntegrationToken } from '@commercelayer/js-auth'

export default async function sync(
  req: NextApiRequest,
  res: NextApiResponse<string | void>
) {
  const token = await getIntegrationToken({
    clientId: process.env.CL_SYNC_CLIENT_ID,
    clientSecret: process.env.CL_SYNC_CLIENT_SECRET,
    endpoint: process.env.CL_ENDPOINT
  })

  // const message = `${token.accessToken} / ${token.expires}`
  // res.status(200).json({ text: message });
  console.log('My access token: ', token.accessToken)
  console.log('Expiration date: ', token.expires)

}
