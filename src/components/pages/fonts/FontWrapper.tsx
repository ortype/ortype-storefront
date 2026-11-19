'use client'
import type { Font } from '@/types'
import { Box, Flex } from '@chakra-ui/react'
import React, { useMemo, useRef } from 'react'
import { DimensionsProvider } from './contexts/dimensionsContext'
import { getFontSections, isFontPageModule } from './font-sections'
import FontSubNav from './font-sub-nav'
import FontContainer from './FontContainer'
import FontHeader from './FontHeader'
import LegacyModulesContainer from './legacy-modules-container'
import {
  hasSpecimenContent,
  resolveSpecimenPages,
} from './specimens/specimen-data'
import SpecimensSection from './specimens/specimens-section'
import { useFontSectionNavigation } from './use-font-section-navigation'
import { SPECIMENS_ID } from './specimens/specimen-sizing'

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
    const specimenPages = useMemo(
      () => resolveSpecimenPages(font.specimens),
      [font.specimens]
    )
    const hasSpecimens = hasSpecimenContent(specimenPages)
    const targetRef = useRef<HTMLDivElement>(null)

    const { activeId, navigate } = useFontSectionNavigation(
      hasSpecimens ? [{ id: SPECIMENS_ID }, ...sections] : sections,
      targetRef
    )

    return (
      <Box bg={'colorPalette.fg'}>
        <FontSubNav
          font={font}
          activeId={activeId}
          navigate={navigate}
          sections={sections}
          hasSpecimens={hasSpecimens}
        />

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
              {/* Specimens share the font data, but must not depend on the
                  legacy module loading gate or spread-overflow state below. */}
              {hasSpecimens && (
                <SpecimensSection
                  isActive={activeId === SPECIMENS_ID}
                  pages={specimenPages}
                  fontId={font._id}
                />
              )}
              {pageModules.length > 0 && (
                <LegacyModulesContainer
                  modules={pageModules}
                  sections={sections}
                  isDraftMode={isDraftMode}
                />
              )}
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
