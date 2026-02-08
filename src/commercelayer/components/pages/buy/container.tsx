'use client'
import { BuyProvider } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import type { BuyFontsQueryResult } from '@/types'
import { Box, Center, Spinner, Text } from '@chakra-ui/react'
import { useRef } from 'react'

interface Props {
  children: JSX.Element[] | JSX.Element
  font: BuyFontsQueryResult['font']
}

const BuyContainer = ({ font, children }: Props): JSX.Element => {
  const hasInitializedRef = useRef(false)
  const { orderId, isLoading, skuOptions } = useOrderContext()

  const isReady = !isLoading && skuOptions && skuOptions.length > 0

  // Once ready, never show spinner again
  if (isReady) {
    hasInitializedRef.current = true
  }

  if (!hasInitializedRef.current && !isReady) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )
  }

  return <BuyProvider font={font}>{children}</BuyProvider>
}

export default BuyContainer
