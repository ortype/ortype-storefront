'use client'

import { Box } from '@chakra-ui/react'
import { useInView } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import SpecimenCarousel from './specimen-carousel'
import {
  composeSpecimenSpreads,
  type SpecimenPage as Page,
} from './specimen-data'
import SpecimenLayoutToggle from './specimen-layout-toggle'
import SpecimenPage, { specimenEditAttribute } from './specimen-page'
import {
  getSpreadWidth,
  PAGE_RATIO,
  SPECIMENS_ID,
  SPREAD_RATIO,
  type SpecimenMode,
} from './specimen-sizing'
import { useSpecimenLayout } from './use-specimen-layout'
import { useSpecimenTransition } from './use-specimen-transition'

export default function SpecimensSection({
  inView,
  pages,
  fontId,
}: {
  inView: boolean
  pages: Page[]
  fontId: string
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { gridRef, width, desktop, viewportHeight } = useSpecimenLayout()
  // Desktop mode never controls the mobile presentation, which is always pages.
  const [mode, setMode] = useState<SpecimenMode>('overview')
  const spreads = useMemo(() => composeSpecimenSpreads(pages), [pages])
  const gap = Math.min(64, Math.max(24, width * 0.05))
  const spreadWidth = getSpreadWidth(mode, width, viewportHeight, gap)
  const singlePages = mode === 'pages'
  const transition = useSpecimenTransition(
    gridRef,
    `${width}-${viewportHeight}-${desktop}`
  )

  return (
    <Box
      ref={sectionRef}
      as='section'
      id={SPECIMENS_ID}
      role='region'
      aria-label='Specimens'
      tabIndex={-1}
      width='100%'
      bg='black'
      px={{ base: 4, md: '6.7vw' }}
      py={{ base: 6, md: 10 }}
      scrollMarginTop={{ base: '8rem', xl: '5rem' }}
      _focusVisible={{ outline: '2px solid white', outlineOffset: '-2px' }}
      data-sanity={specimenEditAttribute(fontId)}
      css={{ overflowAnchor: 'none' }}
    >
      <Box ref={gridRef}>
        {width > 0 ? (
          desktop ? (
            <Box
              display='grid'
              style={{
                gridTemplateColumns: `repeat(${mode === 'overview' ? 2 : 1}, minmax(0, 1fr))`,
                gap,
              }}
            >
              {/* Stable spread/page keys preserve content and avoid replaying
                  entry reveals when only the desktop arrangement changes. */}
              {spreads.map((spread, index) => (
                <Box
                  key={spread.key}
                  data-specimen-spread={spread.key}
                  role='group'
                  aria-label={
                    singlePages
                      ? `Specimen pages ${index * 2 + 1} and ${index * 2 + 2}`
                      : `Specimen spread ${index + 1}`
                  }
                  display='flex'
                  flexDirection={singlePages ? 'column' : 'row'}
                  position='relative'
                  mx={mode === 'overview' ? 0 : 'auto'}
                  style={{
                    width: spreadWidth,
                    aspectRatio: singlePages ? undefined : SPREAD_RATIO,
                    gap: singlePages ? gap : 0,
                  }}
                >
                  {/* Keep the authored pairs mounted in every desktop mode.
                      Pages stacks their children at full spread-view width;
                      unlike mobile, this remains a vertical document flow. */}
                  {spread.pages.map((page) => (
                    <SpecimenPage
                      key={page.key}
                      page={page}
                      width={singlePages ? spreadWidth : spreadWidth / 2}
                    />
                  ))}
                  <Box
                    position='absolute'
                    top={0}
                    bottom={0}
                    left='50%'
                    width='1px'
                    bg='blackAlpha.200'
                    pointerEvents='none'
                    aria-hidden='true'
                    display={singlePages ? 'none' : 'block'}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <SpecimenCarousel pages={pages} width={width} />
          )
        ) : (
          <Box
            width='100%'
            aria-hidden='true'
            style={{ aspectRatio: desktop ? SPREAD_RATIO : PAGE_RATIO }}
          />
        )}
      </Box>
      <SpecimenLayoutToggle
        value={mode}
        visible={desktop && inView && width > 0}
        onValueChange={(value) => transition(() => setMode(value))}
      />
    </Box>
  )
}
