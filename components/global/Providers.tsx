'use client'
import { IdentityProvider } from '@/commercelayer/providers/Identity'
import { OrderProvider } from '@/commercelayer/providers/Order'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import Webfonts from '@/components/global/Webfonts'
import { Provider as ChakraProvider } from '@/components/ui/provider'
import {
  CommerceLayer,
  OrderContainer,
  OrderStorage,
} from '@commercelayer/react-components'

const config: CommerceLayerAppConfig = {
  slug: process.env.NEXT_PUBLIC_CL_SLUG ?? '',
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID ?? '',
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT ?? '',
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN ?? '',
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
                resetPasswordUrl: '/',
              }}
            >
              {(ctx) => (
                <CommerceLayer
                  accessToken={ctx.settings.accessToken}
                  endpoint={config.endpoint}
                >
                  <OrderStorage persistKey={`order`}>
                    <OrderContainer>
                      <OrderProvider config={ctx.clientConfig}>
                        <SettingsProvider config={{ ...config, marketId }}>
                          {({ settings, isLoading }) => {
                            return isLoading ? (
                              <div>{'Loading...'}</div>
                            ) : !settings.isValid ? (
                              <div>{'Invalid settings config'}</div>
                            ) : (
                              <CustomerProvider
                                customerId={settings.customerId}
                                accessToken={settings.accessToken}
                                domain={config.endpoint}
                                {...config}
                              >
                                {children}
                              </CustomerProvider>
                            )
                          }}
                        </SettingsProvider>
                      </OrderProvider>
                    </OrderContainer>
                  </OrderStorage>
                </CommerceLayer>
              )}
            </IdentityProvider>
          </Webfonts>
        </ApolloClientProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
