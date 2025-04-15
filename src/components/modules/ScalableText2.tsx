import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { Box } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

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
  const { padding, pageAspect, conversion } = useDimensions()

  const [fontSize, setFontSize] = useState(initialFontSize)

  // The main resize logic
  const calculateNewFontSize = useCallback(() => {
    const container = containerRef.current
    const innerContainer = innerRef.current

    if (!container || !innerContainer || isNaN(conversion)) return

    let newFontSize = initialFontSize

    const calculateOverflow = (size: number) => {
      // Apply the font size
      innerContainer.style.fontSize = `${size * conversion}px`
      innerContainer.style.lineHeight = `${
        size * lineHeightConversion * conversion
      }px`

      const containerHeight = container.clientHeight
      const containerWidth = container.clientWidth
      const textHeight = innerContainer.clientHeight
      const textWidth = innerContainer.clientWidth

      return textWidth > containerWidth || textHeight > containerHeight
    }

    let low = minFontSize
    let high = newFontSize

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)

      if (calculateOverflow(mid)) {
        high = mid - 1
      } else {
        newFontSize = mid
        low = mid + 1
      }
    }

    setFontSize(newFontSize)
  }, [initialFontSize, conversion])

  // Option 2: Using lodash (pick one approach)
  const debouncedResizeLodash = useCallback(
    debounce(calculateNewFontSize, 50),
    [calculateNewFontSize]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      // Use either debouncedResize or debouncedResizeLodash
      debouncedResizeLodash()
    })

    resizeObserver.observe(container)

    // Initial calculation
    calculateNewFontSize()

    return () => {
      resizeObserver.disconnect()
      // If using lodash, cancel any pending debounced calls
      debouncedResizeLodash.cancel()
    }
  }, [tabIndex, conversion, debouncedResizeLodash, calculateNewFontSize])

  return (
    <Box
      overflow={'auto'}
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
