import ImageSanityNext from '@/components/global/Image'
import { Box, Text } from '@chakra-ui/react'
import React from 'react'

const BlockImage = React.memo(
  ({ value, width, maxWidth, hideCaption }) => {
    if (!value?.asset) {
      return null
    }
    return (
      <Box as="figure" width={width} maxWidth={maxWidth}>
        <ImageSanityNext image={value} alt={value.altText || ''} />
      </Box>
    )
  },
  (prevProps, nextProps) => {
    // this is an 'areEqual' callback
    // console.log({prevProps, nextProps})
    if (prevProps.width !== nextProps.width) {
      return false
    }
    return true
  }
)

BlockImage.displayName = 'BlockImage'

export default BlockImage
