import {
  BlockParams,
  type BlockStyle,
  type BlockStyleOptions,
  type BlockStyleParams,
} from '@/components/composite/Book/bookTypes'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import BookBlock from './book-block'
import type { BookRenderFont } from './book-page-content'
import styles from './book-page.module.css'

const getBlockStyle = (
  params: BlockStyleParams,
  options: BlockStyleOptions
): BlockStyle => {
  const { fontSize, lineGap, marginBottom, lineCount } = params
  const { contentArea, distanceTop, difference, conversion } = options

  const calcLineHeight = fontSize * contentArea

  let height = calcLineHeight * lineCount
  if (lineGap !== null && lineGap !== 0) {
    if (lineGap > 0) {
      height = height - lineGap * lineCount
    } else {
      height = height + lineGap * lineCount
    }
  }

  const transformValue = -fontSize * distanceTop

  return {
    transformValue,
    outerWrapperMarginTop: `${difference * conversion}px`,
    outerWrapperMarginBottom: `${marginBottom * conversion}px`,
    innerWrapperStyle: {
      lineHeight: `${calcLineHeight * conversion}px`,
      height: `${height * conversion}px`,
      fontSize: `${fontSize * conversion}px`,
    },
    offsetValue: `${transformValue * conversion}px`,
    conversion,
  }
}

type ColumnProps = {
  font: BookRenderFont
  defaultVariantId: string
  width: number
  colWidth: number
  conversion: number
  blocks: BlockParams[]
  reveal?: boolean
}

// The column consumes explicit font data so the same geometry works in Studio
// without recreating the storefront's context/provider tree.
const Column = ({
  font,
  conversion,
  width,
  blocks,
  defaultVariantId,
  colWidth,
  reveal = true,
}: ColumnProps) => {
  if (width !== 100) {
    colWidth = colWidth - 30
  }

  const queryWidth = Math.floor(Number((width / 100) * colWidth))

  // Create a ref for the column and use the useInView hook
  const columnRef = useRef(null)
  const inView = useInView(columnRef, {
    once: true, // Only trigger the animation once
    amount: 0.1, // Amount of element that needs to be visible to trigger
  })

  return (
    <div
      ref={columnRef}
      className={styles.column}
      style={{
        flex: `0 0 calc(${width}% - ${30 * conversion}px)`,
        maxWidth: `calc(${width}% - ${30 * conversion}px)`,
        margin: `0 ${15 * conversion}px`,
      }}
    >
      {blocks.map((block, idx) => {
        if (font?.metrics) {
          const { blockId, variantId, ...queryArgs } = block
          const layout = getBlockStyle(block, {
            conversion,
            ...font.metrics,
            // The preceding block's transform is the next block's offset.
            // Derive it directly instead of mutating a running render variable.
            difference:
              idx === 0
                ? 0
                : -blocks[idx - 1].fontSize * font.metrics.distanceTop,
          })

          return (
            <BookBlock
              key={blockId}
              font={font}
              // Stable staggering preserves legacy reveals without rerolling
              // animations whenever a Studio thumbnail or frontend rerenders.
              delay={reveal ? (idx * 0.173) % 0.8 : 0}
              line={{
                blockId: blockId,
                colWidth: queryWidth,
                variantId: variantId || defaultVariantId,
                ...queryArgs,
              }}
              layout={layout} // BlockStyle
              entry={block.entry}
              inView={!reveal || inView}
              reveal={reveal}
            />
          )
        }
      })}
    </div>
  )
}

export default Column
