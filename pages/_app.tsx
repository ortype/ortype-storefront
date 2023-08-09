import 'components/data/i18n'
import 'tailwindcss/tailwind.css'

import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import chakraTheme from '@chakra-ui/theme'
import { CommerceLayer } from '@commercelayer/react-components'
import { CustomerProvider } from 'components/data/CustomerProvider'
import { SettingsProvider } from 'components/data/SettingsProvider'
import { GlobalHeader } from 'components/GlobalHeader'
import { GetInitialProps } from 'next'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'

const {
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Divider,
  Button,
  ButtonGroup,
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
    RadioGroup,
    Radio,
    Button,
    ButtonGroup,
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
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
  },
})

function App({ Component, pageProps, props }: AppProps) {
  // @TODO: Don't show GlobalHeader on /studio route

  // @TODO: Add Types for getLayout
  // https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts#with-typescript
  const getLayout = Component.getLayout || ((page) => page)
  console.log('getLayout: ', getLayout())

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
                <GlobalHeader settings={settings} />
                {getLayout(<Component {...pageProps} />)}
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
