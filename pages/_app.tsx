import 'components/data/i18n'
import 'tailwindcss/tailwind.css'

import { ApolloProvider } from '@apollo/client'
import { AuthorizerProvider } from '@authorizerdev/authorizer-react'
import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import chakraTheme from '@chakra-ui/theme'
import { CommerceLayer } from '@commercelayer/react-components'
import { ApolloClientProvider } from 'components/data/ApolloProvider'
import { CustomerProvider } from 'components/data/CustomerProvider'
import { SettingsProvider } from 'components/data/SettingsProvider'
import { GlobalHeader } from 'components/GlobalHeader'
import Webfonts from 'components/Webfonts'
import { GetInitialProps } from 'next'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import { useEffect } from 'react'

const {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RadioGroup,
  Radio,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Divider,
  Button,
  ButtonGroup,
  Box,
  Center,
  Container,
  Flex,
  Grid,
  SimpleGrid,
  GridItem,
  Stack,
  VStack,
  HStack,
  Switch,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} = chakraTheme.components

const theme = extendBaseTheme({
  components: {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    RadioGroup,
    Radio,
    Checkbox,
    Button,
    ButtonGroup,
    Input,
    FormControl,
    FormLabel,
    Heading,
    Text,
    Divider,
    Box,
    Center,
    Container,
    Flex,
    Grid,
    SimpleGrid,
    GridItem,
    Stack,
    VStack,
    HStack,
    Switch,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
  },
})

function onUnload() {
  sessionStorage && sessionStorage.removeItem('sessionId')
}

function App({ Component, pageProps, props }: AppProps) {
  // @TODO: Don't show GlobalHeader on /studio route

  // @TODO: Add Types for getLayout
  // https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#with-typescript
  const getLayout = Component.getLayout || ((page) => page)
  console.log('getLayout: ', getLayout())

  useEffect(() => {
    sessionStorage &&
      sessionStorage.setItem(
        'sessionId',
        Math.random().toString(36).substr(2, 16)
      )
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  return (
    <ChakraBaseProvider theme={theme}>
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
                    <GlobalHeader settings={settings} />
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
    </ChakraBaseProvider>
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
