'use client'

import { Box, Button, HStack, Text } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import type { SpecimenPage as Page } from './specimen-data'
import SpecimenPage from './specimen-page'

export default function SpecimenCarousel({
  pages,
  width,
}: {
  pages: Page[]
  width: number
}) {
  // Mobile exposes every authored page in one horizontal rail, not a capped
  // preview or a second desktop mode. No autoplay or looping obscures the order.
  const [viewportRef, embla] = useEmblaCarousel({
    align: 'start',
    loop: false,
    slidesToScroll: 1,
  })
  const [selected, setSelected] = useState(0)
  const reducedMotion = useReducedMotion()
  const onSelect = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    embla.on('select', onSelect)
    embla.on('reInit', onSelect)
    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', onSelect)
    }
  }, [embla, onSelect])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Do not hijack document navigation or keys intended for child controls.
    if (!embla || event.target !== event.currentTarget) return
    switch (event.key) {
      case 'ArrowLeft':
        embla.scrollPrev(!!reducedMotion)
        break
      case 'ArrowRight':
        embla.scrollNext(!!reducedMotion)
        break
      case 'Home':
        embla.scrollTo(0, !!reducedMotion)
        break
      case 'End':
        embla.scrollTo(pages.length - 1, !!reducedMotion)
        break
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <Box
      role='region'
      aria-roledescription='carousel'
      aria-label='Specimen pages'
    >
      <Box
        ref={viewportRef}
        overflow='hidden'
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label='Use left and right arrow keys to browse pages'
        _focusVisible={{ outline: '2px solid white', outlineOffset: '4px' }}
        // Embla handles horizontal drags; native vertical scroll/pinch stay free.
        // Users can scroll past the section without swiping through every page.
        css={{ touchAction: 'pan-y pinch-zoom' }}
      >
        <Box display='flex'>
          {pages.map((page, index) => (
            <Box
              key={page.key}
              flex='0 0 100%'
              minW={0}
              role='group'
              aria-roledescription='slide'
              aria-label={`Page ${index + 1} of ${pages.length}`}
              aria-hidden={index !== selected}
              inert={index !== selected}
            >
              <SpecimenPage page={page} width={width} />
            </Box>
          ))}
        </Box>
      </Box>
      <HStack justify='space-between' color='white' pt={3}>
        <Button
          size='xs'
          variant='plain'
          color='white'
          disabled={selected === 0}
          aria-label='Previous specimen page'
          onClick={() => embla?.scrollPrev(!!reducedMotion)}
        >
          ←
        </Button>
        <Text
          fontSize='xs'
          role='status'
          aria-live='polite'
          aria-atomic='true'
        >
          {selected + 1} / {pages.length}
        </Text>
        <Button
          size='xs'
          variant='plain'
          color='white'
          disabled={selected === pages.length - 1}
          aria-label='Next specimen page'
          onClick={() => embla?.scrollNext(!!reducedMotion)}
        >
          →
        </Button>
      </HStack>
    </Box>
  )
}
