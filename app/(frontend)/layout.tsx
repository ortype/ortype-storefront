import { cache } from 'react'
import 'tailwindcss/tailwind.css'

import Providers from '@/components/global/Providers'
import { Metadata } from 'next'
import { getIntegrationToken } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'

export const metadata: Metadata = {
  title: 'Or Type',
  description: 'You or me or we',
}

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

async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  const marketId = (await getMarketId()) || ''
  return (
    <html lang="en">
      <body>
        <Providers marketId={marketId}>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
