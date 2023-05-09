import 'tailwindcss/tailwind.css'
import { ChakraBaseProvider, extendBaseTheme } from '@chakra-ui/react'
import { AppProps } from 'next/app'

import chakraTheme from '@chakra-ui/theme'

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraBaseProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraBaseProvider>
  )
}
