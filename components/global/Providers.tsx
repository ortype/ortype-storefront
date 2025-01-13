'use client'
import theme from '@/@chakra-ui/theme'
import { IdentityProvider } from '@/commercelayer/providers/Identity'
import { OrderProvider } from '@/commercelayer/providers/Order'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import Webfonts from '@/components/global/Webfonts'
import { ChakraProvider } from '@chakra-ui/react'
import { CommerceLayer, OrderStorage } from '@commercelayer/react-components'

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
      <ChakraProvider theme={theme} resetCSS={true}>
        <ApolloClientProvider initialApolloState={{}}>
          <Webfonts>
            <IdentityProvider
              config={{
                ...config,
                returnUrl: '/',
                resetPasswordUrl: '/',
                scope: marketId,
              }}
            >
              {(ctx) => (
                <OrderProvider
                  {...config}
                  accessToken={ctx.settings.accessToken}
                >
                  <OrderStorage persistKey={`order`}>
                    <SettingsProvider config={{ ...config, marketId }}>
                      {({ settings, isLoading }) => {
                        return isLoading ? (
                          <div>{'Loading...'}</div>
                        ) : !settings.isValid ? (
                          <div>{'Invalid settings config'}</div>
                        ) : (
                          <CommerceLayer
                            accessToken={settings.accessToken}
                            endpoint={config.endpoint}
                          >
                            <CustomerProvider
                              customerId={settings.customerId}
                              accessToken={settings.accessToken}
                              domain={config.endpoint}
                              {...config}
                            >
                              {children}
                            </CustomerProvider>
                          </CommerceLayer>
                        )
                      }}
                    </SettingsProvider>
                  </OrderStorage>
                </OrderProvider>
              )}
            </IdentityProvider>
          </Webfonts>
        </ApolloClientProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
