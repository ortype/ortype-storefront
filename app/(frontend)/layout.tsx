import { cache } from 'react'
import 'tailwindcss/tailwind.css'
import { SessionProvider } from 'next-auth/react'
import { BASE_PATH, auth } from '@/lib/auth'
import Providers from '@/components/global/Providers'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'

// https://github.com/vercel/next.js/discussions/54075

export const metadata: Metadata = {
  title: 'Or Type',
  description: 'You or me or we',
}

const getMarketId = unstable_cache(async () => {
  try {
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
  } catch (e) {
    console.log('getmarketId error: ', e)
    /*
     Server  getmarketId error:  {
      status: 429,
      body: '{\n' +
        '    "errors": {\n' +
        '        "title": "Too Many Requests",\n' +
        '        "code": "THROTTLED",\n' +
        '        "status": 429\n' +
        '  }\n' +
        '}',
      code: 'ESTATUS'
    }
    */
    // this error still crashes the dev server
    // @TODO: look into error handling in RootLayout/Server Components Next.js
  }
  return null
}, ['commerce-layer-marketId'])

async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  // @TODO: is it possible to server side cache this request?
  // we are getting HTTP errors durning development
  // ah, we actually had duplicate Providers wrapping, perhaps that was the issue
  const marketId = (await getMarketId()) || ''
  const session = await auth()
  return (
    <html lang="en">
      <body>
        <SessionProvider basePath={BASE_PATH} session={session}>
          <Providers marketId={marketId}>{children}</Providers>
        </SessionProvider>
      </body>
    </html>
  )
}

export default RootLayout
