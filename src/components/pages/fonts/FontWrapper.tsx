'use client'
import Modules from '@/components/modules'
import { Box, Button, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import React, { useMemo, useRef } from 'react'
import { SpreadContainerProvider } from './components/SpreadContainer'
import { DimensionsProvider } from './contexts/dimensionsContext'
import FontContainer from './FontContainer'
import FontHeader from './FontHeader'

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
    <Box bg={'brand.900'}>
      {/*<DynamicBuyContainer font={font}>
        <DynamicBuy />
      </DynamicBuyContainer>*/}
      <Button
        // @TODO: look into how to set this up in button.ts
        bg={'red'}
        color={'white'}
        pos={'fixed'}
        size={'md'}
        top={4}
        right={14}
        fontSize={'lg'}
        px={'0.75rem'}
        minW={'auto'}
        borderRadius={'3rem'}
        zIndex={'docked'}
        asChild
      >
        <Link href={`/buy/${font.slug}`}>{`Buy`}</Link>
      </Button>

      <FontContainer font={font} moreFonts={moreFonts}>
        <DimensionsProvider targetRef={targetRef}>
          <Flex
            mx={'auto'}
            py={'10vh'}
            pos={'relative'}
            wrap={'wrap'}
            ref={targetRef}
          >
            {font?.headerVideo && (
              <FontHeader
                title={font.title || font.shortName || 'Untitled'}
                variantId={font.defaultVariant?._id}
                video={font.headerVideo}
              />
            )}
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
