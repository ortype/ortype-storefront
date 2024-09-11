import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'

interface ScalableTextProps {
  children: ReactNode
}

const ScalableText: React.FC<OverflowDetectorProps> = ({
  index,
  children,
  _key,
  overflowCol,
}) => {
  const hiddenRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const initialFontSize = 60
  const lineHeightConversion = 64 / 60
  const [fontSize, setFontSize] = useState(60) // Initial font size
  const { padding, pageAspect, conversion } = useSpreadContainer()
  const hiddenContainer = hiddenRef.current
  const innerContainer = innerRef.current

  useEffect(() => {
    const resizeFont = () => {
      if (hiddenContainer) {
        let newFontSize = fontSize
        const hiddenHeight = hiddenContainer.clientHeight

        let textHeight = innerContainer.clientHeight
        console.log('ScalableText resizeFont(): ', hiddenHeight, textHeight)

        if (textHeight > hiddenHeight && newFontSize > 12) {
          newFontSize -= 1
          console.log(
            'ScalableText while: ',
            textHeight,
            hiddenHeight,
            newFontSize,
            innerContainer.style.fontSize
          )
          textHeight = innerContainer.clientHeight
          if (fontSize !== newFontSize) {
            console.log('ScalableText setFontSize(): ', newFontSize)
            setFontSize(newFontSize)
          }
        }
      }
    }

    resizeFont()
  }, [
    fontSize,
    conversion,
    hiddenContainer?.clientHeight,
    innerContainer?.clientHeight,
  ])

  return (
    <>
      <Box
        className={'overflow-detector'}
        aria-hidden="true"
        sx={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          top: 0,
          left: 0,
          // @NOTE: elements with this aspect padding must have a width, or it collapses entirely
          w: '100%',
          h: '100%',
        }}
      >
        <Box
          ref={hiddenRef}
          className={'hidden-container'}
          position={'absolute'}
          overflow={'auto'}
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          m={padding}
          style={{
            fontSize: `${fontSize * conversion}px`,
            lineHeight: fontSize * lineHeightConversion * conversion + 'px',
          }}
        >
          <Box className={'inner-container'} ref={innerRef}>
            {
              // @TODO: for this Tab use-case we actually need to measure each TabPanels
              // and run the logic if the tab changes (or run the logic behind the scenes already for each TabPanel)
              children
            }
          </Box>
        </Box>
      </Box>
      <Box
        overflow={'hidden'}
        h={'100%'}
        w={'100%'}
        style={{
          display: 'flex',
        }}
        flexDirection={'column'}
        justifyContent={'space-between'}
        style={{
          fontSize: `${fontSize * conversion}px`,
          lineHeight: fontSize * lineHeightConversion * conversion + 'px',
        }}
      >
        {children}
      </Box>
    </>
  )
}

export default ScalableText
