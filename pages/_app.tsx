import { ApolloProvider } from '@apollo/client'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'
import { ApolloClientProvider } from 'components/data/ApolloProvider'
import { CustomerProvider } from 'components/data/CustomerProvider'
import 'components/data/i18n'
import { SettingsProvider } from 'components/data/SettingsProvider'
import { GlobalHeader } from 'components/GlobalHeader'
import Webfonts from 'components/Webfonts'
// import { GetInitialProps } from 'next'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import 'tailwindcss/tailwind.css'

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

function App({ Component, pageProps, props }: AppProps) {
  // @TODO: Add Types for getLayout
  // https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#with-typescript
  const getLayout = Component.getLayout || ((page) => page)
  console.log('getLayout: ', getLayout())

  const { pathname } = useRouter()
  const hideHeader = pathname.includes('/book') || pathname.includes('/studio')

  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  return (
    <>
      <ChakraProvider theme={theme}>
        <SettingsProvider config={{ ...props }}>
          {({ settings, isLoading }) => {
            return isLoading ? (
              <div>{'Loading...'}</div>
            ) : !settings.isValid ? (
              <div>{'Invalid settings config'}</div>
            ) : (
              <CommerceLayer
                accessToken={settings.accessToken}
                endpoint={props.endpoint}
              >
                <CustomerProvider
                  customerId={settings.customerId}
                  accessToken={settings.accessToken}
                  domain={props.endpoint}
                  {...props}
                >
                  <AuthorizerProvider
                    config={{
                      authorizerURL: props.authorizerURL,
                      redirectURL:
                        typeof window !== 'undefined' && window.location.origin,
                      clientID: props.authorizerClientId,
                      // extraHeaders: {}, // Optional JSON object to pass extra headers in each authorizer requests.
                    }}
                  >
                    <ApolloClientProvider
                      initialApolloState={pageProps?.initialApolloState}
                    >
                      {!hideHeader && <GlobalHeader settings={settings} />}
                      <Webfonts>
                        {getLayout(<Component {...pageProps} />)}
                      </Webfonts>
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

App.getInitialProps = async (ctx) => {
  return {
    props: {
      authorizerURL: 'https://authorizer-newww.koyeb.app/',
      authorizerClientId: 'd5814c60-03ba-4568-ac96-70eb7a8f397f', // obtain your client id from authorizer dashboard
      slug: 'or-type-mvp',
      selfHostedSlug: 'or-type-mvp',
      clientId: process.env.CL_CLIENT_ID,
      endpoint: process.env.CL_ENDPOINT,
      marketId: process.env.CL_SCOPE_GLOBAL,
      domain: process.env.CL_DOMAIN,
    },
  }
}

export default appWithTranslation(App)
