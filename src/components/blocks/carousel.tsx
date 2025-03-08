import BlockImage from '@/components/blocks/image'
import { Box, Flex, GridItem, Text, useBreakpointValue } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const ScreenReaderText = ({ children }) => (
  <Box as="span" position={'absolute'} left={'-999em'}>
    {children}
  </Box>
)

const Arrow = ({ onClick, direction, enabled, children }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick()
      e.preventDefault()
    }
  }

  return (
    <Box
      className="arrow"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={'button'}
      tabIndex={enabled ? 0 : -1}
      aria-label={direction === 'prev' ? 'Previous slide' : 'Next slide'}
      aria-disabled={!enabled}
      css={{
        display: ['none', null, 'flex'],
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 'modal',
        position: 'absolute',
        width: ['8.3333333333%'],
        top: 0,
        bottom: 0,
        ...(direction === 'prev' && {
          left: 0,
          pl: 8,
          alignItems: 'start',
          // transform: 'translateX(-10px)',
        }),
        ...(direction === 'next' && {
          right: 0,
          pr: 8,
          alignItems: 'end',
          // transform: 'translateX(10px)',
        }),
        outline: 'none',
        cursor: 'pointer',
        transition: `300ms transform ease-in-out, 300ms opacity ease-in-out`,
        opacity: 1,
        visibility: enabled ? 'initial' : 'hidden',
        pointerEvents: enabled ? 'initial' : 'none',
        span: {
          width: '4rem',
          height: '4rem',
          lineHeight: '46px',
          fontSize: '46px',
          display: 'inline-block',
          textAlign: 'center',
          bg: 'white',
          borderRadius: '50%',
        },
      }}
    >
      {children}
    </Box>
  )
}

const Carousel = ({ value = {} }) => {
  const wHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
  const height = useBreakpointValue(
    {
      base: wHeight * 0.3,
      sm: wHeight * 0.3,
      md: wHeight * 0.35,
      lg: wHeight * 0.4,
      xl: wHeight * 0.45,
      '2xl': wHeight * 0.5,
    },
    {
      fallback: 'md',
    }
  )

  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: 'start',
  })

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])
  const scrollTo = useCallback(
    (index) => embla && embla.scrollTo(index),
    [embla]
  )

  // Add a ref to the carousel container for focus management
  const carouselRef = useRef(null)

  // Add keyboard navigation handler
  const handleKeyDown = useCallback(
    (event) => {
      if (!embla) return

      // Only handle keyboard events if they're not targeting an input, textarea, or other form element
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLButtonElement
      ) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          embla.scrollPrev()
          event.preventDefault()
          break
        case 'ArrowRight':
          embla.scrollNext()
          event.preventDefault()
          break
        case 'Home':
          scrollTo(0)
          event.preventDefault()
          break
        case 'End':
          scrollTo(scrollSnaps.length - 1)
          event.preventDefault()
          break
        default:
          break
      }
    },
    [embla, scrollSnaps, scrollTo]
  )

  // Setup keyboard event listeners globally (on document)
  useEffect(() => {
    if (!embla) return

    // Attach to document instead of carousel element for global keyboard navigation
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [embla, handleKeyDown])

  const onSelect = useCallback(() => {
    if (!embla) return
    setSelectedIndex(embla.selectedScrollSnap())
    setPrevBtnEnabled(embla.canScrollPrev())
    setNextBtnEnabled(embla.canScrollNext())
  }, [embla, setSelectedIndex])

  useEffect(() => {
    if (!embla) return
    onSelect()
    setScrollSnaps(embla.scrollSnapList())
    embla.on('select', onSelect)
  }, [embla, setScrollSnaps, onSelect])

  // Remove auto-focus since global keyboard navigation doesn't require focus

  return (
    <Box mx={'-1rem'} position={'relative'}>
      <ScreenReaderText>
        Use arrow keys to navigate between slides. Press Home to go to the first
        slide or End to go to the last slide.
      </ScreenReaderText>
      <Arrow enabled={prevBtnEnabled} onClick={scrollPrev} direction={'prev'}>
        <Text as={'span'} fontSize={'2xl'}>{`←`}</Text>
        <ScreenReaderText>{'Previous slide'}</ScreenReaderText>
      </Arrow>
      <Arrow enabled={nextBtnEnabled} onClick={scrollNext} direction={'next'}>
        <Text as={'span'} fontSize={'2xl'}>{`→`}</Text>
        <ScreenReaderText>{'Next slide'}</ScreenReaderText>
      </Arrow>
      <Box
        width={'100%'}
        overflow={'hidden'}
        ref={(node) => {
          emblaRef(node)
          carouselRef.current = node
        }}
        role="region"
        aria-label="Image carousel"
        aria-roledescription="carousel"
      >
        <Flex>
          {(value.images || []).map((image, index) => {
            const width = height * image.aspectRatio
            return (
              <Box
                key={image._key}
                position="relative"
                pl={'1rem'}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${value.images.length}`}
                aria-hidden={index !== selectedIndex}
              >
                <BlockImage
                  value={image}
                  position="relative"
                  width={`${width}px`}
                  maxWidth={'100%'}
                  hideCaption={true}
                />
              </Box>
            )
          })}
        </Flex>
      </Box>
      <Flex
        position={'absolute'}
        bottom={'-2.25rem'}
        left={'30%'}
        justify={'space-between'}
      >
        <Text as={'span'}>{`${selectedIndex + 1} / ${
          scrollSnaps.length
        }`}</Text>
      </Flex>
    </Box>
  )
}

export default Carousel
