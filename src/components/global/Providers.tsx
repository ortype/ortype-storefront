'use client'
import { IdentityProvider } from '@/commercelayer/providers/identity'
import { OrderProvider } from '@/commercelayer/providers/Order'
import OrderStorage from '@/commercelayer/providers/Order/Storage'
import { PriceLocaleProvider } from '@/commercelayer/providers/price-locale'
import type { PriceLocale } from '@/commercelayer/utils/price-locale'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { Provider as ChakraProvider } from '@/components/ui/provider'
import { type LicenseMetrics, type UiLabels } from '@/sanity/lib/queries'

const config: CommerceLayerAppConfig = {
  slug: process.env.NEXT_PUBLIC_CL_SLUG ?? '',
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID ?? '',
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT ?? '',
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN ?? '',
  persistKey: 'order',
  // scope: props.marketId
}

function Providers({
  children,
  marketId,
  labels,
  metrics,
  priceLocale,
}: {
  children: React.ReactNode
  marketId: string
  labels?: UiLabels | null
  metrics: LicenseMetrics
  priceLocale: PriceLocale
}) {
  return (
    <>
      <PriceLocaleProvider priceLocale={priceLocale}>
        <ChakraProvider>
          <ApolloClientProvider initialApolloState={{}}>
            <IdentityProvider
              config={{
                ...config,
                scope: marketId,
                returnUrl: '/',
                resetPasswordUrl: '/forgot-password',
              }}
            >
              {(ctx) => (
                <OrderStorage persistKey={config.persistKey}>
                  <OrderProvider
                    config={ctx.clientConfig}
                    labels={labels}
                    metrics={metrics}
                  >
                    {children}
                  </OrderProvider>
                </OrderStorage>
              )}
            </IdentityProvider>
          </ApolloClientProvider>
        </ChakraProvider>
      </PriceLocaleProvider>
    </>
  )
}

export default Providers
