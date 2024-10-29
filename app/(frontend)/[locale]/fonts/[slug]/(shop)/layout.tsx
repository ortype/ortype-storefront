import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { createApolloClient } from 'hooks/useApollo'
import { cache } from 'react'
import Providers from './Providers'

const getMarketId = cache(async () => {
  const token = await getIntegrationToken({
    clientId: process.env.CL_SYNC_CLIENT_ID || '',
    clientSecret: process.env.CL_SYNC_CLIENT_SECRET || '',
    endpoint: process.env.CL_ENDPOINT || '',
  })

  const cl = CommerceLayer({
    organization: process.env.CL_SLUG || '',
    accessToken: token?.accessToken || '',
  })
  const markets = await cl.markets.list({
    filters: {
      name_eq: 'Global',
    },
  })
  if (markets.length) {
    return `market:${markets.shift().number}`
  }
  return null
})

// This is a Server Component
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    slug: string
  }
}) {
  // const marketId = (await getMarketId()) || ''
  return children
}
