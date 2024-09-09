import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Flex } from '@chakra-ui/react'
import React, { ReactNode, useEffect, useLayoutEffect, useRef } from 'react'

interface OverflowDetectorProps {
  _key: string
  index: number
  children: ReactNode
  overflowCol: boolean
}

/*
const arrayKeysAreEqual = (a1, a2) =>
  a1 === a2 ||
  (a1.length === a2.length && a1.every((f, i) => f._key === a2[i]._key))
*/

const OverflowDetector: React.FC<OverflowDetectorProps> = ({
  index,
  children,
  _key,
  overflowCol,
}) => {
  const hiddenRef = useRef<HTMLDivElement | null>(null)
  const {
    state,
    updateItemAction,
    updateItemsAction,
    padding,
    pageAspect,
    conversion,
  } = useSpreadContainer()

  useEffect(() => {
    // @NOTE: disable the SET_OVERFLOW logic for smaller breakpoints with chakra's useMediaQuery

    const hiddenContainer = hiddenRef.current

    const measureOverflow = () => {
      if (hiddenContainer) {
        const isOverflowing =
          hiddenContainer.scrollHeight > hiddenContainer.offsetHeight
        // `clientHeight` probably works the same as `offsetHeight`

        if (isOverflowing === state.items[_key]?.isOverflowing) {
          return
        }
        updateItemAction({
          _key,
          isOverflowing,
          index,
          overflowCol,
        })

        updateItemsAction({
          _key,
          isOverflowing,
        })
      }
    }

    measureOverflow()
  })

  const isOverflowing = state.items[_key]?.isOverflowing
  const isSpread = isOverflowing && overflowCol
  // console.log('isOverflowing: ', index, isOverflowing)
  // console.log('isSpread: ', index, isSpread)

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
          w: isSpread ? '50%' : '100%',
          h: '100%',
        }}
        _before={{
          height: 0,
          content: `""`,
          display: 'block',
          paddingBottom: pageAspect,
        }}
      >
        <Box
          ref={hiddenRef}
          position={'absolute'}
          overflow={'auto'}
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          p={padding}
        >
          {children}
        </Box>
      </Box>
      <Box
        overflow={'hidden'}
        h={'100%'}
        w={'100%'}
        style={{
          // @NOTE: we need mobile styles that totally ignore the column behavior
          display: isSpread ? 'block' : 'flex',
          columnCount: isSpread ? 2 : 1,
          columnGap: 46 * 2 * conversion + 'px',
        }}
        flexDirection={'column'}
        justifyContent={'space-between'}
      >
        {children}
      </Box>
    </>
  )
}

export default OverflowDetector
