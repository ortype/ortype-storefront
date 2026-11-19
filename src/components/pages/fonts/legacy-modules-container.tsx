'use client'

import Modules from '@/components/modules'
import { Box, Flex } from '@chakra-ui/react'
import { useRef, type CSSProperties } from 'react'
import { SpreadContainerProvider } from './components/SpreadContainer'
import { DimensionsProvider } from './contexts/dimensionsContext'
import type { FontModule, FontSection } from './font-sections'
import { getSpreadWidth } from './specimens/specimen-sizing'
import { useSpecimenLayout } from './specimens/use-specimen-layout'

export default function LegacyModulesContainer({
  modules,
  sections,
  isDraftMode,
}: {
  modules: FontModule[]
  sections: FontSection[]
  isDraftMode: boolean
}) {
  const modulesRef = useRef<HTMLDivElement>(null)
  const { gridRef: availableRef, width, viewportHeight } = useSpecimenLayout()
  const spreadWidth = getSpreadWidth('spreads', width, viewportHeight, 0)

  return (
    <Box
      ref={availableRef}
      width='100%'
      minW={0}
      // Constrain only from lg, where legacy modules start composing spreads.
      // Below lg keep their existing full-width, single-page/content behavior.
      px={{ base: 0, lg: '6.7vw' }}
    >
      <DimensionsProvider targetRef={modulesRef} spreadLayout>
        <Flex
          ref={modulesRef}
          width='100%'
          maxW={{ base: 'none', lg: 'var(--legacy-spread-width)' }}
          mx='auto'
          position='relative'
          wrap='wrap'
          // The inner measured width drives both 50% pages and 100% spreads.
          // No horizontal gap: two legacy pages already consume the whole row.
          gap={0}
          style={
            {
              '--legacy-spread-width':
                spreadWidth > 0 ? `${spreadWidth}px` : '100%',
            } as CSSProperties
          }
        >
          <SpreadContainerProvider initialItems={modules}>
            <Modules
              value={modules}
              sections={sections}
              isDraftMode={isDraftMode}
            />
          </SpreadContainerProvider>
        </Flex>
      </DimensionsProvider>
    </Box>
  )
}
