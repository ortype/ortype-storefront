import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box } from '@chakra-ui/react'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

interface OverflowDetectorProps {
  children: ReactNode
  count: number
  index: number
  tabIndex: string
}

const ScalableText: React.FC<OverflowDetectorProps> = ({
  index,
  tabIndex,
  children,
  count,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const maxFontSize = 160
  const minFontSize = 12
  const initialFontSize = parseInt(maxFontSize / (1 + count / 20))
  const lineHeightConversion = 64 / 60 // base font size for ratio calculation
  const { padding, pageAspect, conversion } = useSpreadContainer()

  const [fontSize, setFontSize] = useState(initialFontSize)

  useEffect(() => {
    const resizeFont = () => {
      const container = containerRef.current
      const innerContainer = innerRef.current

      if (!container || !innerContainer || isNaN(conversion)) return

      let newFontSize = initialFontSize // Start from initial size

      const calculateOverflow = (size: number) => {
        // Apply the font size
        innerContainer.style.fontSize = `${size * conversion}px`
        innerContainer.style.lineHeight = `${
          size * lineHeightConversion * conversion
        }px`

        const containerHeight = container.clientHeight
        // const containerWidth = container.clientWidth
        const textHeight = innerContainer.clientHeight
        // const textWidth = innerContainer.clientWidth

        // @NOTE: testing how it works by height only
        return textHeight > containerHeight
        // return textWidth > containerWidth || textHeight > containerHeight
      }

      // Binary search approach for faster convergence
      let low = minFontSize
      let high = newFontSize

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)

        if (calculateOverflow(mid)) {
          // If text overflows, try a smaller size
          high = mid - 1
        } else {
          // If text fits, this might be our size, but try if we can go larger
          newFontSize = mid
          low = mid + 1
        }
      }

      setFontSize(newFontSize)
    }

    resizeFont()
  }, [
    tabIndex,
    conversion,
    initialFontSize,
    // Only include dependencies that should trigger a resize
    containerRef.current?.clientWidth,
    containerRef.current?.clientHeight,
  ])

  return (
    <Box
      position={'absolute'}
      top={0}
      left={0}
      bottom={0}
      right={0}
      className={'outer-container'}
      ref={containerRef}
    >
      <Box
        className={'inner-container'}
        display={'inline-block'}
        style={{
          fontSize: `${fontSize * conversion}px`,
          lineHeight: `${fontSize * lineHeightConversion * conversion}px`,
        }}
        ref={innerRef}
      >
        {children}
      </Box>
    </Box>
  )
}

export default ScalableText
