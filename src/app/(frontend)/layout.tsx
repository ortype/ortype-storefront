import {
  PRICE_LOCALE_COOKIE,
  PRICE_LOCALE_HEADER,
  type PriceLocale,
} from '@/commercelayer/utils/price-locale'
import { getIntegrationCommerceLayer } from '@/commercelayer/utils/get-integration-commerce-layer'
import Providers from '@/components/global/Providers'
import { DisableDraftMode } from '@/sanity/components/DisableDraftMode'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { normalizeLicenseMetrics } from '@/sanity/lib/normalize'
import { licenseMetricsQuery, uiLabelsQuery } from '@/sanity/lib/queries'
import { VisualEditing } from 'next-sanity/visual-editing'
import { unstable_cache } from 'next/cache'
import { cookies, draftMode, headers } from 'next/headers'
import Globals from 'src/components/global/Globals'
import './storefront.css'

// https://github.com/vercel/next.js/discussions/54075
const isDev = process.env.NODE_ENV === 'development'

const getMarketId = unstable_cache(
  async () => {
    try {
      const cl = await getIntegrationCommerceLayer()

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
  },
  ['commerce-layer-marketId'],
  {
    revalidate: isDev ? 60 : 3600, // Faster revalidation in dev
    tags: ['commerce-layer'],
  }
)

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const marketId = (await getMarketId()) || ''
  const { data: labels } = await sanityFetch({
    query: uiLabelsQuery,
  })
  const { data: metricsData } = await sanityFetch({
    query: licenseMetricsQuery,
  })
  const metrics = normalizeLicenseMetrics(metricsData)
  if (metrics.sizes.length === 0 || metrics.media.length === 0) {
    console.warn(
      '[FrontendLayout] License metrics missing from Sanity settings — the shop requires company sizes and media types to be defined.'
    )
  }

  // Resolved in src/proxy.ts from the visitor's Accept-Language header.
  // Fall back to the cookie (e.g. static/edge caching edge cases), then to
  // 'en-US' if neither is present.
  const priceLocale =
    ((await headers()).get(PRICE_LOCALE_HEADER) as PriceLocale | null) ??
    ((await cookies()).get(PRICE_LOCALE_COOKIE)?.value as PriceLocale | null) ??
    'en-US'

  return (
    <>
      <Globals />
      <Providers
        marketId={marketId}
        labels={labels}
        metrics={metrics}
        priceLocale={priceLocale}
      >
        {children}
      </Providers>
      {(await draftMode()).isEnabled && (
        <>
          <SanityLive />
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </>
  )
}
