import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'

interface ScalableTextProps {
  children: ReactNode
  count: number
  index: number
  tabIndex: number
}

const ScalableText: React.FC<OverflowDetectorProps> = ({
  index,
  tabIndex,
  children,
  count,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  // Use an inverse relationship. Here’s a simple example using a basic inverse proportion:

  const maxFontSize = 160 // max font size

  // Adjust these minimum and maximum values to suit your needs
  const minFontSize = 12

  // Ensure that count is always greater than 0 to avoid division by zero
  const initialFontSize = parseInt(maxFontSize / (1 + count / 20))

  console.log(`Calculated Font Size: ${initialFontSize} for ${count} items`)

  const lineHeightConversion = 64 / 60 // base font size for ratio calculation
  const [fontSize, setFontSize] = useState(initialFontSize) // Initial font size
  const { padding, pageAspect, conversion } = useSpreadContainer()
  const container = containerRef.current
  const innerContainer = innerRef.current

  useEffect(() => {
    const resizeFont = () => {
      if (container) {
        let newFontSize = fontSize
        const containerHeight = container.clientHeight
        const containerWidth = container.clientWidth
        const textHeight = innerContainer.clientHeight
        const textWidth = innerContainer.clientWidth

        console.log(
          'ScalableText (',
          index,
          ')',
          'ScalableText height: ',
          containerHeight,
          textHeight,
          ' and width: ',
          containerWidth,
          textWidth
        )

        // @NOTE: there is an issue with this if condition
        if (
          (textWidth > containerWidth || textHeight > containerHeight) &&
          newFontSize > minFontSize
        ) {
          newFontSize -= 1
          console.log(
            'ScalableText: container:',
            containerHeight,
            ' text height:',
            textHeight,
            ' new font size: ',
            newFontSize
          )
          // textHeight = innerContainer.clientHeight
          // textWidth = innerContainer.clientWidth
          if (fontSize !== newFontSize) {
            console.log('ScalableText setFontSize(): ', newFontSize)
            setFontSize(newFontSize)
          }
        }
      }
    }

    resizeFont()
  }, [
    tabIndex,
    fontSize,
    conversion,
    container?.clientHeight,
    container?.clientWidth,
    innerContainer?.clientHeight,
    innerContainer?.clientWidth,
  ])

  return (
    <Box
      overflow={'auto'}
      style={{
        fontSize: `${fontSize * conversion}px`,
        lineHeight: fontSize * lineHeightConversion * conversion + 'px',
      }}
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
        ref={innerRef}
      >
        {children}
      </Box>
    </Box>
  )
}

export default ScalableText
