import 'tailwindcss/tailwind.css'
import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import { AppProps } from 'next/app'

import chakraTheme from '@chakra-ui/theme'

const {
  Heading,
  Text,
  Divider,
  Button,
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Stack,
  VStack,
  HStack,
} = chakraTheme.components

const theme = extendBaseTheme({
  components: {
    Button,
    Heading,
    Text,
    Divider,
    Box,
    Container,
    Flex,
    Grid,
    GridItem,
    Stack,
    VStack,
    HStack,
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraBaseProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraBaseProvider>
  )
}
