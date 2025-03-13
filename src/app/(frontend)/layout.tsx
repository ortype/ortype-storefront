import Providers from '@/components/global/Providers'
import { BASE_PATH, auth } from '@/lib/auth'
import { DisableDraftMode } from '@/sanity/components/DisableDraftMode'
import { SanityLive } from '@/sanity/lib/live'
import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { SessionProvider } from 'next-auth/react'
import { VisualEditing } from 'next-sanity'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'

// https://github.com/vercel/next.js/discussions/54075

const getMarketId = unstable_cache(async () => {
  try {
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID || '',
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET || '',
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
  } catch (e) {
    console.log('getmarketId error: ', e)
  }
  return null
}, ['commerce-layer-marketId'])

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const marketId = (await getMarketId()) || ''
  const session = await auth()
  return (
    <>
      <SessionProvider basePath={BASE_PATH} session={session}>
        <Providers marketId={marketId}>{children}</Providers>
      </SessionProvider>
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </>
  )
}
