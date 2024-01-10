'use client'

import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import Webfonts from '@/components/global/Webfonts'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

export const theme = extendTheme({ colors })

function onUnload() {
  sessionStorage && sessionStorage.removeItem('sessionId')
}

const config = {
  authorizerURL: 'https://authorizer-newww.koyeb.app/',
  authorizerClientId: 'd5814c60-03ba-4568-ac96-70eb7a8f397f', // obtain your client id from authorizer dashboard
  slug: process.env.NEXT_PUBLIC_CL_SLUG,
  selfHostedSlug: process.env.NEXT_PUBLIC_CL_SLUG,
  clientId: process.env.NEXT_PUBLIC_CL_CLIENT_ID,
  endpoint: process.env.NEXT_PUBLIC_CL_ENDPOINT,
  domain: process.env.NEXT_PUBLIC_CL_DOMAIN,
}

function Providers({
  marketId,
  children,
}: {
  marketId: string | null
  children: React.ReactNode
}) {
  // @TODO: migrate nested layouts per page
  // const getLayout = Component.getLayout || ((page) => page)

  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  const pathname = usePathname()
  const hideHeader =
    pathname?.includes('/book') || pathname?.includes('/studio')

  return (
    <>
      <ChakraProvider theme={theme}>
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
                  <AuthorizerProvider
                    config={{
                      authorizerURL: config.authorizerURL,
                      redirectURL:
                        typeof window !== 'undefined' && window.location.origin,
                      clientID: config.authorizerClientId,
                      // extraHeaders: {}, // Optional JSON object to pass extra headers in each authorizer requests.
                    }}
                  >
                    <ApolloClientProvider initialApolloState={{}}>
                      {!hideHeader && <GlobalHeader settings={settings} />}
                      <Webfonts>{children}</Webfonts>
                    </ApolloClientProvider>
                  </AuthorizerProvider>
                </CustomerProvider>
              </CommerceLayer>
            )
          }}
        </SettingsProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
