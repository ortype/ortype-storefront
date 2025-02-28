import BlockImage from '@/components/blocks/image'
import { Box, Flex, GridItem, Text, useBreakpointValue } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useState } from 'react'

const ScreenReaderText = ({ children }) => (
  <Box as="span" position={'absolute'} left={'-999em'}>
    {children}
  </Box>
)

const Arrow = ({ onClick, direction, enabled, children }) => {
  return (
    <Box
      className="arrow"
      onClick={onClick}
      role={'link'}
      tabIndex={'0'}
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
          pl: 5,
          alignItems: 'start',
          transform: 'translateX(-10px)',
        }),
        ...(direction === 'next' && {
          right: 0,
          pr: 5,
          alignItems: 'end',
          transform: 'translateX(10px)',
        }),
        outline: 'none',
        cursor: 'pointer',
        transition: `300ms transform ease-in-out, 300ms opacity ease-in-out`,
        opacity: 0,
        visibility: enabled ? 'initial' : 'hidden',
        pointerEvents: enabled ? 'initial' : 'none',
        [`&:hover`]: {
          textDecoration: 'none',
          opacity: 1,
        },
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
  // align, // align to the edge of the body
  // const align = (window.innerWidth / 50) / 100
  // console.log('align: ', align)

  const height = useBreakpointValue(
    {
      base: 400,
      sm: 400,
      md: 600,
      lg: 700,
      xl: 750,
      '2xl': 800,
    },
    {
      fallback: 'md',
    }
  )

  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: 'start',
    // https://www.embla-carousel.com/api/options/#breakpoints
    breakpoints: {
      '(min-width: 1680px)': {
        // align: 0.25,
      },
    },
    // 0 to 1... how much is 50px of the current viewport
  })
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  // @TODO: we have some left alignment issues... how can we align to the left edge
  // of the body content while overflowing to the browser window edge?
  // pl on the wrapper of the slide works but its too narrow to create the effect

  // @TODO: Arrows or not? Well some of these slides may be clickable products, and we may click to enlarge, so dragging versus clicking may be confusing

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])
  // const scrollTo = useCallback((index) => embla && embla.scrollTo(index), [embla])

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

  return (
    <Box
      // colSpan={3}
      mx={'-1rem'}
      position={'relative'}
      _hover={{
        ['.arrow']: {
          opacity: 1,
          transform: 'translateX(0)',
        },
      }}
    >
      <Flex
        position={'absolute'}
        top={'0px'}
        right={'2rem'}
        justify={'space-between'}
      >
        <Text textStyle={'rimd'}>{`${selectedIndex + 1} / ${
          scrollSnaps.length
        }`}</Text>
      </Flex>
      <Arrow enabled={prevBtnEnabled} onClick={scrollPrev} direction={'prev'}>
        <Text as={'span'} fontSize={'2xl'}>{`←`}</Text>
        <ScreenReaderText>{'Prev'}</ScreenReaderText>
      </Arrow>
      <Arrow enabled={nextBtnEnabled} onClick={scrollNext} direction={'next'}>
        <Text as={'span'} fontSize={'2xl'}>{`→`}</Text>
        <ScreenReaderText>{'Next'}</ScreenReaderText>
      </Arrow>
      <Box width={'100%'} overflow={'hidden'} ref={emblaRef}>
        <Flex>
          {(value.images || []).map((image) => {
            const width = height * image.aspectRatio
            return (
              <Box key={image._key} position="relative" pl={'1rem'}>
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
    </Box>
  )
}

export default Carousel
