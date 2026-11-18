'use client'
import Modules from '@/components/modules'
import { Box, Flex } from '@chakra-ui/react'
import type { Font } from '@/types'
import React, { useMemo, useRef } from 'react'
import { SpreadContainerProvider } from './components/SpreadContainer'
import { DimensionsProvider } from './contexts/dimensionsContext'
import FontContainer from './FontContainer'
import FontHeader from './FontHeader'
import FontSubNav from './font-sub-nav'
import { getFontSections, isFontPageModule } from './font-sections'

// Type definitions for better TypeScript support
interface FontWrapperProps {
  moreFonts?: Font[]
  font: Font
  isDraftMode?: boolean
}

const FontWrapper = React.memo(
  ({ moreFonts, font, isDraftMode = false }: FontWrapperProps) => {
    // Memoize modules to prevent unnecessary rerenders
    const modules = useMemo(() => font?.modules || [], [font?.modules])
    const pageModules = useMemo(
      () => modules.filter(isFontPageModule),
      [modules]
    )
    const sections = useMemo(() => getFontSections(modules), [modules])
    const targetRef = useRef<HTMLDivElement>(null)

    return (
      <Box bg={'brand.900'}>
        <FontSubNav font={font} sections={sections} contentRef={targetRef} />

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
                  variantId={font.defaultVariant?._id ?? ''}
                  video={font.headerVideo}
                />
              )}
              <SpreadContainerProvider initialItems={pageModules}>
                <Modules
                  value={pageModules}
                  sections={sections}
                  isDraftMode={isDraftMode}
                />
              </SpreadContainerProvider>
            </Flex>
          </DimensionsProvider>
        </FontContainer>
      </Box>
    )
  }
)

// Add display name for better debugging
FontWrapper.displayName = 'FontWrapper'

export default FontWrapper
