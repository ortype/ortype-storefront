'use client'
import { GET_LATEST_POEM_ENTRIES } from '@/graphql/queries'
import { ON_POEM_UPDATED } from '@/graphql/subscriptions'
import { useQuery } from '@apollo/client'
import {
  AbsoluteCenter,
  Box,
  BoxProps,
  IconButton,
  Span,
  VStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { FC, useEffect, useMemo, useState } from 'react'

interface VerticalTextProps extends BoxProps {
  text: string
  letterSpacing?: string | number // Custom letter spacing
  color?: string
  fontSize?: string | number | object // Support responsive fontSize
}

export const VerticalText: FC<VerticalTextProps> = ({
  text,
  letterSpacing = '0.2em',
  color,
  fontSize,
  ...props
}) => {
  return (
    <Box
      display="grid"
      gridAutoFlow="row"
      gap={letterSpacing}
      justifyContent="center"
      {...props}
    >
      {text.split('').map((char, index) => (
        <Span
          key={`${char}-${index}`}
          color={color}
          fontSize={fontSize}
          textAlign="center"
          textTransform={'uppercase'}
          fontFamily={'Alltaf-Bold'}
          // @TODO: bold font
        >
          {char}
        </Span>
      ))}
    </Box>
  )
}

// Create a motion box component
const MotionBox = motion(Box)

// Animation variants for slide up
const variants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
    },
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
    },
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

interface OnAirProps {}

export const OnAir: FC<OnAirProps> = ({ ...props }) => {
  const [isHovered, setIsHovered] = useState(false)

  const {
    subscribeToMore,
    data: poemData,
    loading,
    error,
  } = useQuery(GET_LATEST_POEM_ENTRIES, {
    variables: {},
  })

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ON_POEM_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          console.warn('on-air: No subscription data received')
          return prev
        }

        const latestPoemEntries = [
          ...prev.latestPoemEntries,
          subscriptionData.data.poemUpdated,
        ]

        return {
          latestPoemEntries,
        }
      },
      onError: (error) => {
        console.error('on-air: Subscription error:', error)
      },
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [subscribeToMore])

  useEffect(() => {
    // Show hovered state on mount
    setIsHovered(true)

    // Reset after 2 seconds
    const timer = setTimeout(() => {
      setIsHovered(false)
    }, 1500) // Adjust timing as needed

    return () => clearTimeout(timer)
  }, [])

  const poem =
    poemData?.latestPoemEntries?.length > 0 &&
    poemData.latestPoemEntries.filter(
      (item) => item.sessionId === sessionStorage.getItem('sessionId')
    )

  // Limit poem array to 4 items
  const limitedPoem = useMemo(() => {
    if (!poem) return []
    return [...poem].slice(poem.length - 4, poem.length)
  }, [poem])

  return (
    <Box pos={'fixed'} bottom={4} left={4}>
      <IconButton
        rounded={'full'}
        bg={'red'}
        size={'sm'}
        transition={'all 0.3s ease'}
        h={isHovered ? '8rem' : 'var(--or-sizes-8)'}
        transform={isHovered ? 'scale(0.95)' : 'none'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        asChild
      >
        <Link href={'/poem'}>
          <AbsoluteCenter
            display="inline-flex"
            axis={'horizontal'}
            className="vertical-text"
            transition="opacity 0.2s ease"
            opacity={isHovered ? 1 : 0}
          >
            <Span>
              <VerticalText text={'On Air'} color={'white'} />
            </Span>
          </AbsoluteCenter>
        </Link>
      </IconButton>
      {limitedPoem.length > 0 && (
        <VStack
          alignItems={'left'}
          pos={'absolute'}
          left={'calc(100% + 0.5rem)'}
          bottom={0}
          gap={2}
        >
          <AnimatePresence mode="popLayout">
            {limitedPoem.map((item, index) => (
              <MotionBox
                key={item._id}
                custom={index}
                initial={'hidden'}
                animate={'visible'}
                exit={'exit'}
                variants={variants}
                className={item.variantId}
                py={2}
                px={2}
                bg={'brand.100'}
                borderRadius={'l3'}
                whiteSpace={'nowrap'}
                width={'fit-content'}
                fontSize={'lg'}
                maskImage={
                  limitedPoem.length > 3 && index === 0
                    ? 'linear-gradient(to top, rgba(255, 255, 255, 1) 17%, rgba(255, 255, 255, 0) 100%)'
                    : ''
                }
              >
                {item.entry}
              </MotionBox>
            ))}
          </AnimatePresence>
        </VStack>
      )}
    </Box>
  )
}
