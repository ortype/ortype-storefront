'use client'
import theme from '@/@chakra-ui/theme'
import authorizerConfig from '@/authorizerConfig'
import { ApolloClientProvider } from '@/components/data/ApolloProvider'
import { CustomerProvider } from '@/components/data/CustomerProvider'
import { SettingsProvider } from '@/components/data/SettingsProvider'
import { GlobalHeader } from '@/components/global/GlobalHeader'
import Webfonts from '@/components/global/Webfonts'
import { ChakraProvider } from '@chakra-ui/react'
import { CommerceLayer } from '@commercelayer/react-components'

function Providers({
  children,
  marketId,
}: {
  children: React.ReactNode
  marketId: string
}) {
  return (
    <>
      <ChakraProvider theme={theme} resetCSS={true}>
        <ApolloClientProvider initialApolloState={{}}>
          <GlobalHeader marketId={marketId} />
          <Webfonts>{children}</Webfonts>
        </ApolloClientProvider>
      </ChakraProvider>
    </>
  )
}

export default Providers
