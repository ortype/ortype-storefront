'use client'

import {
  PAGE_RATIO,
  SPREAD_RATIO,
} from '@/components/pages/fonts/specimens/specimen-sizing'
import type { ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'
import styles from './book-preview-media.module.css'
import BookSpreadThumbnail from './book-spread-thumbnail'

// Sanity's list and grid media slots have different aspect ratios. Fit the paper
// into both dimensions rather than cropping a portrait page into a square icon.
export default function BookPreviewMedia(
  props: ComponentProps<typeof BookSpreadThumbnail>
) {
  const container = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState({ width: 0, height: 0 })
  const ratio = props.side ? PAGE_RATIO : SPREAD_RATIO

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBounds({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const width = Math.min(bounds.width, bounds.height * ratio)
  return (
    <div ref={container} className={styles.media} aria-hidden='true'>
      {width > 0 && (
        <div style={{ width, flexShrink: 0 }}>
          <BookSpreadThumbnail {...props} />
        </div>
      )}
    </div>
  )
}
