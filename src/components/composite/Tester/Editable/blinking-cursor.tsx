import { Box } from '@chakra-ui/react'

// Reusable BlinkingCursor component
const BlinkingCursor = ({
  isVisible = true,
  variantId = '',
  isLoading = false,
}) => {
  return (
    <Box
      display={isVisible ? 'inline-block' : 'none'}
      fontFamily="inherit"
      fontWeight="100"
      pointerEvents="none"
      userSelect="none"
      bg="black"
      w="2px"
      h="8rem"
      mx="2px"
      className={variantId}
      animation={`blink 0.7s infinite`}
      opacity={isLoading ? 0.5 : 1}
      alignSelf="center"
      verticalAlign="middle"
    />
  )
}

export default BlinkingCursor
