// https://usehooks.com/useWindowSize/
import { useEffect, useState } from 'react'

/**
 * @summary Measures the innerWidth/innerHeight of the browser window
 * @returns {Object} Width and height of browser window
 */
export default function useWindowSize() {
  const isClient = typeof window === 'object'

  function getSize() {
    return {
      wWidth: isClient ? window.innerWidth : undefined,
      wHeight: isClient ? window.innerHeight : undefined,
    }
  }

  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    if (!isClient) {
      return false
    }

    function handleResize() {
      setWindowSize(getSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount and unmount

  // console.log("windowSize: ", windowSize)
  return windowSize
}
