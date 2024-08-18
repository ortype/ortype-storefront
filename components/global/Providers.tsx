'use client'
import authorizerConfig from '@/authorizerConfig'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import Webfonts from '@/components/global/Webfonts'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

export const theme = extendTheme({ colors })

const onStateChangeCallback = async ({ token }) => {
  await fetch(
    '/api/session',
    {
      method: 'POST',
      body: JSON.stringify(token),
    },
    { cache: 'no-store' }
  )
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
      <ChakraProvider theme={theme}>
        <AuthorizerProvider
          config={{
            authorizerURL: authorizerConfig.authorizerURL,
            redirectURL:
              typeof window !== 'undefined' && window.location.origin,
            clientID: authorizerConfig.clientID,
          }}
          onStateChangeCallback={onStateChangeCallback}
        >
          <ApolloClientProvider initialApolloState={{}}>
            <GlobalHeader marketId={marketId} />
            <Webfonts>{children}</Webfonts>
          </ApolloClientProvider>
        </AuthorizerProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
