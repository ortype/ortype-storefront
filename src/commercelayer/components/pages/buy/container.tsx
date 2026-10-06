'use client'
import { DraftGuardRegistrar } from '@/commercelayer/components/pages/buy/use-draft-guard'
import { BuyProvider } from '@/commercelayer/providers/buy'
import { useOrderContext } from '@/commercelayer/providers/order'
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

  const isReady = skuOptions && skuOptions.length > 0

  // Once ready, never show spinner again
  if (isReady) {
    hasInitializedRef.current = true
  }

  if (!hasInitializedRef.current && !isReady) {
    return (
      <Box pos='fixed' inset='0' bg='bg/80'>
        <Center h='full'>
          <Spinner color='black' size={'xl'} />
        </Center>
      </Box>
    )
  }

  // Keyed by font uid so switching fonts (BuyNav) re-seeds the draft buffer
  return (
    <BuyProvider key={font?.uid} font={font}>
      {/* Mirrors the draft into the discard-draft guard (see use-draft-guard) */}
      <DraftGuardRegistrar />
      {children}
    </BuyProvider>
  )
}

export default BuyContainer
