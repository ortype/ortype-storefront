import { Box } from '@chakra-ui/react'
import { getTesterSizes } from '../tester-sizing'

// Reusable BlinkingCursor component
const BlinkingCursor = ({
  isVisible = true,
  variantId = '',
  isLoading = false,
  table = false,
  right = '-2px',
}) => {
  return (
    <Box
      display={isVisible ? 'inline-block' : 'none'}
      fontFamily="inherit"
      fontWeight="100"
      pointerEvents="none"
      userSelect="none"
      bg="black"
      w="1px"
      h={getTesterSizes(table).lineHeight}
      mb={table ? 0 : '1.5rem'}
      mt={table ? 0 : '1rem'}
      mx="2px"
      className={variantId}
      animation={`blink 0.7s infinite`}
      opacity={isLoading ? 0.5 : 1}
      alignSelf="center"
      verticalAlign="middle"
      pos={'absolute'}
      right={right}
    />
  )
}

export default BlinkingCursor
