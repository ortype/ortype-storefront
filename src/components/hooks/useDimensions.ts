import { useState } from 'react'
import { useDebounceCallback, useResizeObserver } from 'usehooks-ts'

type Size = {
  width: number
  height: number
}

/**
 * @summary Measures the offsetWidth/Height of a given DOM element
 * @param {String} targetRef The DOM element to measure
 * @returns {Object} Width and height of DOM element
 */
export default function useDimensions(elementRef) {
  const [{ width, height }, setSize] = useState<Size>({
    width: 1360,
    height: 930,
  })

  const onResize = useDebounceCallback(setSize, 250)

  useResizeObserver({
    ref: elementRef,
    onResize,
  })

  return { width, height }
}
