'use client'
import Modules from '@/components/modules'
import { Box, Flex } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import React, { useMemo, useRef } from 'react'
import { SpreadContainerProvider } from './components/SpreadContainer'
import { DimensionsProvider } from './contexts/dimensionsContext'
import FontContainer from './FontContainer'

const DynamicBuyContainer: any = dynamic(
  () => import('@/components/composite/BuyContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicBuy: any = dynamic(() => import('@/components/composite/Buy'), {
  loading: function LoadingSkeleton() {
    return <div />
  },
})

// Type definitions for better TypeScript support
interface FontWrapperProps {
  moreFonts?: any[]
  font: any
}

const FontWrapper = React.memo(({ moreFonts, font }: FontWrapperProps) => {
  // Memoize modules to prevent unnecessary rerenders
  const modules = useMemo(() => font?.modules || [], [font?.modules])
  const targetRef = useRef<HTMLDivElement>(null)

  return (
    <Box bg={'#000'}>
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
      <FontContainer font={font} moreFonts={moreFonts}>
        <DimensionsProvider targetRef={targetRef}>
          <Flex
            // Spread
            w={'80vw'}
            mx={'auto'}
            py={'10vh'}
            pos={'relative'}
            wrap={'wrap'}
            ref={targetRef}
          >
            <SpreadContainerProvider initialItems={modules}>
              <Modules value={modules} />
            </SpreadContainerProvider>
          </Flex>
        </DimensionsProvider>
      </FontContainer>
    </Box>
  )
})

// Add display name for better debugging
FontWrapper.displayName = 'FontWrapper'

export default FontWrapper
