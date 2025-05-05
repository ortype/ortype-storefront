import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { useSpreadState } from '@/components/pages/fonts/contexts/spreadStateContext'
import { Box, Flex } from '@chakra-ui/react'
import type { ChildrenElement } from 'CustomApp'
import debounce from 'lodash.debounce'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PageModal from './PageModal'

interface OverflowDetectorValue {
  isOverflowing: boolean
  isSpread: boolean
  overflowCol: boolean
  state: any
}

interface OverflowDetectorProps {
  _key: string
  index: number
  overflowCol: boolean
  children:
    | ((props: OverflowDetectorValue) => ChildrenElement)
    | ChildrenElement
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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { padding, pageAspect, conversion, size } = useDimensions()
  const { state, updateItemAction, updateItemsAction } = useSpreadState()

  // Memoized measurement function with performance tracking
  const measureOverflow = useCallback(() => {
    // @NOTE: disable the SET_OVERFLOW logic for smaller breakpoints with chakra's useMediaQuery
    const hiddenContainer = hiddenRef.current

    if (hiddenContainer) {
      const isOverflowing =
        hiddenContainer.scrollHeight > hiddenContainer.offsetHeight
      // `clientHeight` probably works the same as `offsetHeight`

      // Only update if the state has changed
      if (isOverflowing === state.items[_key]?.isOverflowing) {
        return
      }

      // Update state with batched updates
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
  }, [
    _key,
    state.items,
    updateItemAction,
    updateItemsAction,
    index,
    overflowCol,
  ])

  // Create debounced version of the measurement function
  const debouncedMeasureOverflow = useMemo(
    () => debounce(measureOverflow, 100),
    [measureOverflow]
  )

  // Effect for initial measurement and resize handling
  useEffect(() => {
    // Initial measurement
    debouncedMeasureOverflow()

    // Set up resize observer for dynamic measurements
    const observer = new ResizeObserver(() => {
      debouncedMeasureOverflow()
    })

    // Observe both the hidden container and the main container
    if (hiddenRef.current) {
      observer.observe(hiddenRef.current)
    }

    // Also measure when the size from context changes
    if (size?.width && size?.height) {
      debouncedMeasureOverflow()
    }

    // Clean up
    return () => {
      debouncedMeasureOverflow.cancel()
      observer.disconnect()
    }
  }, [debouncedMeasureOverflow, size?.width, size?.height])

  const itemState = state.items[_key]
  const isOverflowing = itemState.isOverflowing
  const isSpread = isOverflowing && overflowCol
  // console.log('isOverflowing: ', index, isOverflowing)
  // console.log('isSpread: ', index, isSpread)

  const value = {
    isOverflowing,
    isSpread,
    overflowCol,
    state: itemState,
  }

  return (
    <>
      <Box
        className={'overflow-detector'}
        aria-hidden="true"
        css={{
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
          css={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
          p={padding}
        >
          {typeof children === 'function' ? children(value) : children}
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
        ref={containerRef}
      >
        {typeof children === 'function' ? children(value) : children}
        {/*
        // deprecated for now
        {!overflowCol && isOverflowing && (
          // @NOTE: `overflowCol === false` we render the PageModal
          <PageModal
            isEven={itemState.index % 2 == 0}
            containerRef={containerRef}
            // const isSpread = isOverflowing && overflowCol
          >
            {typeof children === 'function' ? children(value) : children}
          </PageModal>
        )}*/}
      </Box>
    </>
  )
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(OverflowDetector)
