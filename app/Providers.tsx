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
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'

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
}

function Providers({
  children,
  marketId,
}: {
  children: React.ReactNode
  marketId: string
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

  const settings = {} // @TODO: somehow get the `accessToken` passed to GlobalHeader

  return (
    <>
      <ChakraProvider theme={theme}>
        <AuthorizerProvider
          config={{
            authorizerURL: config.authorizerURL,
            redirectURL:
              typeof window !== 'undefined' && window.location.origin,
            clientID: config.authorizerClientId,
          }}
        >
          <ApolloClientProvider initialApolloState={{}}>
            {!hideHeader && <GlobalHeader marketId={marketId} />}
            <Webfonts>{children}</Webfonts>
          </ApolloClientProvider>
        </AuthorizerProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
