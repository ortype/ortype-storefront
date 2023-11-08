import { useEffect, useLayoutEffect, useState } from 'react'

/**
 * @summary Measures the offsetWidth/Height of a given DOM element
 * @param {String} targetRef The DOM element to measure
 * @returns {Object} Width and height of DOM element
 */
export default function useDimensions(targetRef, width) {
  const getDimensions = () => ({
    width: targetRef.current ? targetRef.current.offsetWidth : 0,
    height: targetRef.current ? targetRef.current.offsetHeight : 0,
  })

  const [dimensions, setDimensions] = useState(getDimensions)

  const handleResize = () => {
    setDimensions(getDimensions())
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useLayoutEffect(() => {
    handleResize()
  }, [width])
  return dimensions
}
