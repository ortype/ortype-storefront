import 'tailwindcss/tailwind.css'

import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import chakraTheme from '@chakra-ui/theme'
import { CommerceLayer } from '@commercelayer/react-components'
import 'components/data/i18n'
import { GetInitialProps } from 'next'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import { CustomerProvider } from 'providers/CustomerProvider'
import { SettingsProvider } from 'providers/SettingsProvider'

const {
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Divider,
  Button,
  Box,
  Container,
  Flex,
  Grid,
  SimpleGrid,
  GridItem,
  Stack,
  VStack,
  HStack,
  Switch,
} = chakraTheme.components

const theme = extendBaseTheme({
  components: {
    Button,
    Input,
    FormControl,
    FormLabel,
    Heading,
    Text,
    Divider,
    Box,
    Container,
    Flex,
    Grid,
    SimpleGrid,
    GridItem,
    Stack,
    VStack,
    HStack,
    Switch,
  },
})

function App({ Component, pageProps, props }: AppProps) {
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
                <Component {...pageProps} />
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
      selfHostedSlug: 'ortype-mvp',
      clientId: process.env.CL_CLIENT_ID,
      endpoint: process.env.CL_ENDPOINT,
      marketId: process.env.CL_SCOPE_GLOBAL,
      domain: process.env.CL_DOMAIN,
    },
  }
}

export default appWithTranslation(App)
