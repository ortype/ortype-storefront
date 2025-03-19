import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import BlinkingCursor from './blinking-cursor'

// TypewriterAnimation component for animation phase
const TypewriterAnimation = ({
  placeholder,
  shouldAnimate = false,
  variantId,
  onAnimationComplete,
  speed = 120,
}) => {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Only start animation if shouldAnimate is true and we have a placeholder
    if (!shouldAnimate || !placeholder) {
      setDisplayText(placeholder || '')
      setIsComplete(true)
      setIsAnimating(false)
      return
    }

    // Reset animation state when placeholder changes
    setDisplayText('')
    setIsComplete(false)
    setIsAnimating(true)

    let i = 0
    const timer = setInterval(() => {
      if (i < placeholder.length) {
        setDisplayText(placeholder.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setIsComplete(true)
        setIsAnimating(false)
        // Call the completion callback when animation finishes
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }
    }, speed)

    return () => clearInterval(timer)
  }, [placeholder, shouldAnimate, speed, onAnimationComplete])

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="12.5rem"
      width="100%"
    >
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        fontSize="8rem"
        lineHeight="12.5rem"
        className={variantId}
        textAlign="center"
      >
        {displayText}
        {!isComplete && <BlinkingCursor variantId={variantId} />}
      </Box>
    </Box>
  )
}

export default TypewriterAnimation
