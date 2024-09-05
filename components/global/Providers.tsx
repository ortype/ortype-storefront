'use client'
import authorizerConfig from '@/authorizerConfig'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import Webfonts from '@/components/global/Webfonts'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'

// 2. Extend the theme to include custom colors, fonts, etc
// https://codesandbox.io/s/chakra-custom-theme-t0o2r?file=/src/index.js
/*
const customTheme = extendTheme({
    colors: {
        brand: {
            50: "#ffffff", // Lighter white
            100: "#e6e6e6",
            200: "#cccccc",
            300: "#b3b3b3",
            400: "#999999",
            500: "#808080",
            600: "#666666",
            700: "#4d4d4d",
            800: "#333333",
            900: "#000000"  // Darker black
        }
    }
});
*/

const colors = {
  brand: {
    50: '#ffffff', // Lighter white
    100: '#ffffff',
    200: '#cccccc',
    300: '#b3b3b3',
    400: '#999999',
    500: '#808080',
    600: '#000000',
    700: '#000000',
    800: '#333333',
    900: '#000000', // Darker black
  },
  gray: {
    600: '#000000',
  },
}

const styles = {
  global: {
    'html, body': {
      color: '#000',
    },
    a: {
      color: '#0000FF',
    },
  },
}

export const theme = extendTheme(
  { colors, styles },
  withDefaultColorScheme({ colorScheme: 'brand' })
)

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
