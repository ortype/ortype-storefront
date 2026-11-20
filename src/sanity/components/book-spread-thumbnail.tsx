'use client'

import BookPageContent, {
  type BookRenderFont,
} from '@/components/book/book-page-content'
import { parseBookSnapshot } from '@/components/book/book-snapshot'
import { BOOK_PAGE } from '@/components/pages/fonts/specimens/specimen-sizing'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './book-spread-thumbnail.module.css'

// Passive artwork can be reused in preview media as well as selection cards.
// It knows nothing about Sanity patches, navigation, or the storefront context.
export default function BookSpreadThumbnail({
  spread,
  font,
  defaultVariantId,
  side,
}: {
  spread?: string | null
  font: BookRenderFont | null
  defaultVariantId: string
  side?: 'verso' | 'recto'
}) {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const content = useMemo(() => parseBookSnapshot(spread), [spread])

  useEffect(() => {
    const element = container.current
    if (!element) return

    // A long book gallery should not mount every typographic block at once.
    // Once mounted, keep the artwork stable while scrolling through the dialog.
    const visibility = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          visibility.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    const resize = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    visibility.observe(element)
    resize.observe(element)
    return () => {
      visibility.disconnect()
      resize.disconnect()
    }
  }, [])

  const metrics = font?.metrics
  const hasMetrics =
    metrics &&
    metrics.unitsPerEm > 0 &&
    metrics.contentArea > 0 &&
    Object.values(metrics).every(Number.isFinite)
  const hasPages = side ? content?.[side] : content?.verso || content?.recto
  const conversion = width / (side ? 1 : 2) / BOOK_PAGE.width
  const padding = `${BOOK_PAGE.margin * conversion}px`

  return (
    <div
      ref={container}
      className={`${styles.spread} ${side ? styles.singlePage : ''}`}
      aria-hidden='true'
    >
      {!hasPages || !hasMetrics || !font ? (
        <span className={styles.placeholder}>
          {!hasPages ? 'No preview available' : 'Font metrics unavailable'}
        </span>
      ) : (
        visible &&
        width > 0 &&
        (side ? [side] : (['verso', 'recto'] as const)).map((pageSide) => (
          <div key={pageSide} className={styles.page}>
            <div
              className={styles.content}
              style={{
                padding,
                fontSize: `${25 * conversion}px`,
                lineHeight: `${36 * conversion}px`,
              }}
            >
              <BookPageContent
                page={content?.[pageSide] ?? null}
                font={font}
                defaultVariantId={defaultVariantId}
                layout={{
                  padding,
                  conversion,
                  colWidth: BOOK_PAGE.columnWidth,
                }}
                fluid
              />
            </div>
          </div>
        ))
      )}
    </div>
  )
}
