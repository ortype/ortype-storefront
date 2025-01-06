'use client'
import theme from '@/@chakra-ui/theme'
import { IdentityProvider } from '@/commercelayer/providers/Identity'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import Webfonts from '@/components/global/Webfonts'
import { ChakraProvider } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'

const config = {
  slug: process.env.NEXT_PUBLIC_CL_SLUG,
  selfHostedSlug: process.env.NEXT_PUBLIC_CL_SLUG,
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID,
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT,
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN,
  returnUrl: '/',
  resetPasswordUrl: '/',
  // scope === marketId
}

function Providers({
  children,
  marketId,
}: {
  children: React.ReactNode
  marketId: string
}) {
  console.log('marektId: ', marketId)
  return (
    <>
      <ChakraProvider theme={theme} resetCSS={true}>
        <ApolloClientProvider initialApolloState={{}}>
          <Webfonts>
          <IdentityProvider config={{ ...config, marketId }}>
            {(ctx) => (
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
            )}
            </IdentityProvider>
          </Webfonts>
        </ApolloClientProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
