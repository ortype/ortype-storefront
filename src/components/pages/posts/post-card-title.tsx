import {
  Box,
  Center,
  Link as ChakraLink,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'

interface Font {
  slug: string
  shortName: string
}

interface FontWithReference {
  font: Font
}

interface FontsListProps {
  fonts: FontWithReference[]
  title: string
  categoryTitle: string
}

const PostCardTitle = ({
  title,
  categoryTitle,
  fonts,
}: FontsListProps): ReactNode => {
  // State to toggle between showing title and fonts
  const [showTitle, setShowTitle] = useState(true)
  // State to track hover state
  const [isHovering, setIsHovering] = useState(false)

  // Set up interval to toggle between title and fonts every 10 seconds
  useEffect(() => {
    // Only set up interval if not hovering
    if (!isHovering) {
      const interval = setInterval(() => {
        setShowTitle((prev) => !prev)
      }, 3000)

      // Clear interval on unmount or when hovering changes
      return () => clearInterval(interval)
    }
  }, [isHovering])

  // Animation variants
  const variants = {
    enter: { opacity: 0, y: `5` },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -`5` },
  }

  // If no fonts, just display the title
  if (!fonts || fonts.length === 0) {
    return (
      <Center>
        <Box as={'span'} whiteSpace={'nowrap'}>
          {title}
        </Box>
      </Center>
    )
  }

  return (
    <Center
      pos={'relative'}
      flexGrow={1}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait">
        {showTitle ? (
          <motion.div
            key="title"
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', left: 0 }}
          >
            <Box as={'span'} lineHeight={1.1}>
              {title}
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="fonts"
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', left: 0 }}
          >
            <Wrap columnGap={1} rowGap={1}>
              {fonts.map(({ font }, index, array) => (
                <WrapItem key={font.slug} whiteSpace={'nowrap'}>
                  <ChakraLink as={Link} href={`fonts/${font.slug}`}>
                    {font.shortName}
                  </ChakraLink>
                  {index < array.length - 1 && ', '}
                </WrapItem>
              ))}
            </Wrap>
          </motion.div>
        )}
      </AnimatePresence>
    </Center>
  )
}

export default PostCardTitle
