import 'tailwindcss/tailwind.css'

import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import chakraTheme from '@chakra-ui/theme'
import { CommerceLayer } from '@commercelayer/react-components'
import { GetInitialProps } from 'next'
import { AppProps } from 'next/app'
import { AppProvider } from 'providers/AppProvider'
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

export default function App({ Component, pageProps, props }: AppProps) {
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
              <AppProvider
                customerId={settings.customerId}
                accessToken={settings.accessToken}
                domain={props.endpoint}
                {...props}
              >
                <Component {...pageProps} />
              </AppProvider>
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
    },
  }
}
