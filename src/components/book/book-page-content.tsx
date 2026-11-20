'use client'

import type { Font } from '@/types'
import type { ComponentProps } from 'react'
import BookColumn from './book-column'
import styles from './book-page.module.css'

// Only the typography data crosses this boundary, not the storefront context or
// Chakra provider. Studio can supply the same data using its authenticated client.
export type BookRenderFont = Pick<Font, 'shortName' | 'metrics'> & {
  variants: Pick<Font['variants'][number], '_id' | 'optionName'>[]
}

export type BookPageContentProps = {
  page:
    | (Pick<ComponentProps<typeof BookColumn>, 'width' | 'blocks'> & {
        colId: string
      })[]
    | null
  defaultVariantId: string
  font: BookRenderFont
  layout: { padding: string; conversion: number; colWidth: number }
  fluid?: boolean
}

// One renderer owns the authored typography in both environments. CSS Modules
// isolate its paper styles; inline values preserve the book's computed geometry.
export default function BookPageContent({
  page,
  defaultVariantId,
  font,
  layout: { padding, conversion, colWidth },
  fluid = false,
}: BookPageContentProps) {
  return (
    <>
      {font.shortName && (
        <div className={styles.header} style={{ padding: `0 ${padding}` }}>
          <div
            className={styles.heading}
            style={{
              paddingTop: fluid ? `${8 * conversion}px` : '0.5rem',
              paddingBottom: fluid ? `${4 * conversion}px` : '0.25rem',
              fontSize: `${13 * conversion}px`,
            }}
          >
            {font.shortName}
          </div>
        </div>
      )}
      {page?.map((column) => (
        <BookColumn
          key={column.colId}
          {...column}
          font={font}
          defaultVariantId={defaultVariantId}
          conversion={conversion}
          colWidth={colWidth}
          reveal={!fluid}
        />
      ))}
    </>
  )
}
