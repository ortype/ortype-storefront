'use client'
import Modules from '@/components/modules'
import { Box, Center, Spinner } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef } from 'react'
import { SpreadContainerProvider } from './components/SpreadContainer'
import { useDimensions } from './contexts/dimensionsContext'
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
interface SpreadModulesProps {
  value: any[]
}

// Loading wrapper that consumes dimensions context directly
const SpreadModules = React.memo(({ value }: SpreadModulesProps) => {
  const { isLoading } = useDimensions()

  if (isLoading) {
    return (
      <Box pos="absolute" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="white" />
        </Center>
      </Box>
    )
  }

  return <Modules value={value} />
})

// Add display name for better debugging
SpreadModules.displayName = 'SpreadModules'
// Type definitions for better TypeScript support
interface FontWrapperProps {
  moreFonts?: any[]
  font: any
}

const FontWrapper = React.memo(({ moreFonts, font }: FontWrapperProps) => {
  // Memoize modules to prevent unnecessary rerenders
  const modules = useMemo(() => font?.modules || [], [font?.modules])

  return (
    <Box bg={'#000'}>
      <DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>
      <FontContainer font={font} moreFonts={moreFonts}>
        {modules.length > 0 && (
          <SpreadContainerProvider initialItems={modules}>
            <SpreadModules value={modules} />
          </SpreadContainerProvider>
        )}
      </FontContainer>
    </Box>
  )
})

// Add display name for better debugging
FontWrapper.displayName = 'FontWrapper'

export default FontWrapper
