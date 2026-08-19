import Providers from '@/components/global/Providers'
import { DisableDraftMode } from '@/sanity/components/DisableDraftMode'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import {
  licenseMetricsQuery,
  normalizeLicenseMetrics,
  uiLabelsQuery,
} from '@/sanity/lib/queries'
import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { VisualEditing } from 'next-sanity/visual-editing'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { PreloadResources } from '../preload-resources'

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
      return `market:id:${markets.shift().id}`
    }
  } catch (e) {
    console.log('getmarketId error: ', e)
  }
  return null
}, ['commerce-layer-marketId'])

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const marketId = (await getMarketId()) || ''
  const { data: labels } = await sanityFetch({ query: uiLabelsQuery })
  const { data: metricsData } = await sanityFetch({
    query: licenseMetricsQuery,
  })
  const metrics = normalizeLicenseMetrics(metricsData)
  if (metrics.sizes.length === 0 || metrics.media.length === 0) {
    console.warn(
      '[FrontendLayout] License metrics missing from Sanity settings — the shop requires company sizes and media types to be defined.',
    )
  }

  return (
    <>
      <PreloadResources />
      <Providers marketId={marketId} labels={labels} metrics={metrics}>
        {children}
      </Providers>
      {(await draftMode()).isEnabled && (
        <>
          <SanityLive refreshOnFocus={false} />
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </>
  )
}
