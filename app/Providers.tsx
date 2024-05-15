'use client'

import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import Webfonts from '@/components/global/Webfonts'
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
                  <ApolloClientProvider initialApolloState={{}}>
                    {!hideHeader && <GlobalHeader settings={settings} />}
                    <Webfonts>{children}</Webfonts>
                  </ApolloClientProvider>
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
