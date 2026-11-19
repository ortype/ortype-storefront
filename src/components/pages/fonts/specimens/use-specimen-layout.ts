'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { SPECIMEN_DESKTOP_QUERY } from './specimen-sizing'

function subscribeDesktop(update: () => void) {
  const media = window.matchMedia(SPECIMEN_DESKTOP_QUERY)
  media.addEventListener('change', update)
  return () => media.removeEventListener('change', update)
}

function subscribeViewport(update: () => void) {
  window.addEventListener('resize', update)
  window.visualViewport?.addEventListener('resize', update)
  return () => {
    window.removeEventListener('resize', update)
    window.visualViewport?.removeEventListener('resize', update)
  }
}

const getDesktop = () => window.matchMedia(SPECIMEN_DESKTOP_QUERY).matches
const getViewportHeight = () =>
  window.visualViewport?.height ?? window.innerHeight
const getServerDesktop = () => false
const getServerHeight = () => 0

export function useSpecimenLayout() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  // Server snapshots avoid guessing a browser size during SSR/hydration.
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktop,
    getServerDesktop
  )
  const viewportHeight = useSyncExternalStore(
    subscribeViewport,
    getViewportHeight,
    getServerHeight
  )

  useEffect(() => {
    const node = gridRef.current
    if (!node) return
    // Measure the actual inner container after section margins, not window width.
    // One shared measurement sizes every spread/page consistently.
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { gridRef, width, desktop, viewportHeight }
}
