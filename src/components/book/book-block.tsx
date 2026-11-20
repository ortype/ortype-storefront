import {
  type BlockStyle,
  type LineParams,
} from '@/components/composite/Book/bookTypes'
import { motion } from 'framer-motion'
import type { BookRenderFont } from './book-page-content'
import styles from './book-page.module.css'

const EntrySpans = ({
  entry,
  line,
  layout,
}: {
  entry?: string
  line: LineParams
  layout: BlockStyle
}) => {
  // Split the string by the closing tag of the span
  const elements = entry?.split(/<\/span>/).map((item, index) => {
    // Trim the item and check if it's not empty
    const trimmedItem = item.trim()
    if (trimmedItem) {
      return (
        <span
          key={index}
          className={styles.entryLine}
          style={{
            marginTop:
              index === 0 ? 0 : `${line.lineGap * layout.conversion}px`,
          }}
        >
          {trimmedItem.replace(/<span>/, '')}
        </span>
      )
    }
    return null
  })

  return <div className={styles.entry}>{elements}</div>
}

// Entry strings are rendered as text, not injected HTML. The thumbnail must
// share the frontend's span handling without trusting snapshot markup.
const Block = ({
  font,
  delay,
  entry,
  line,
  layout,
  inView = false,
  reveal = true,
}: {
  font: BookRenderFont
  entry?: string
  delay: number
  line: LineParams
  layout: BlockStyle
  inView?: boolean
  reveal?: boolean
}) => {
  return (
    <motion.div
      initial={reveal ? { opacity: 0 } : false}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: 0,
        delay: delay,
        ease: 'linear',
      }}
      className={styles.block}
      style={{
        position: 'relative',
        marginTop: layout.outerWrapperMarginTop,
        marginBottom: layout.outerWrapperMarginBottom,
      }}
    >
      <span
        className={styles.label}
        style={{
          fontSize: `${12 * layout.conversion}px`,
          top: `${7 * layout.conversion}px`,
          lineHeight: `1.25`,
        }}
      >
        {font?.variants.find(({ _id }) => line.variantId === _id)?.optionName}
      </span>
      <div
        className={`${styles.text} ${line.variantId || ''}`}
        style={{
          marginTop: `${32.4 * layout.conversion}px`, // account for height of the "label"
          ...layout.innerWrapperStyle,
        }}
      >
        <div
          className={styles.offset}
          style={{
            top: `${layout.offsetValue}`,
          }}
        >
          <EntrySpans entry={entry} line={line} layout={layout} />
        </div>
      </div>
    </motion.div>
  )
}

export default Block
