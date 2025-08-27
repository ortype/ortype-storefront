'use client'
import { IdentityProvider } from '@/commercelayer/providers/Identity'
import { OrderProvider } from '@/commercelayer/providers/Order'
import OrderStorage from '@/commercelayer/providers/Order/Storage'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import Webfonts from '@/components/global/Webfonts'
import { Provider as ChakraProvider } from '@/components/ui/provider'

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
}: {
  children: React.ReactNode
  marketId: string
}) {
  return (
    <>
      <ChakraProvider>
        <ApolloClientProvider initialApolloState={{}}>
          <Webfonts>
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
                  <OrderProvider config={ctx.clientConfig}>
                    <div>{children}</div>
                  </OrderProvider>
                </OrderStorage>
              )}
            </IdentityProvider>
          </Webfonts>
        </ApolloClientProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
