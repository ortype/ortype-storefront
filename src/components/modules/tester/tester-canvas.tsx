'use client'

import { Box, chakra } from '@chakra-ui/react'
import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type CSSProperties,
} from 'react'
import type { getTesterLayout } from './tester-layout'

export default function TesterCanvas({
  initialText,
  revision,
  variantId,
  layout,
  onWidthChange,
}: {
  initialText: string
  revision: number
  variantId: string
  layout: ReturnType<typeof getTesterLayout>
  onWidthChange: (width: number) => void
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const appliedRevision = useRef<number | null>(null)

  // React never reconciles editable children. Only initialization and explicit
  // Reset replace text, preserving native selection, composition and undo.
  useEffect(() => {
    const editor = editorRef.current
    if (!editor || appliedRevision.current === revision) return
    editor.textContent = initialText
    appliedRevision.current = revision
  }, [initialText, revision])

  useEffect(() => {
    const viewport = viewportRef.current
    const editor = editorRef.current
    if (!viewport || !editor) return
    const measure = () => onWidthChange(viewport.clientWidth)
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    const styles = getComputedStyle(editor)
    let cancelled = false
    void document.fonts
      .load(`${styles.fontSize} ${styles.fontFamily}`)
      .then(() => {
        if (!cancelled) measure()
      })
      .catch(() => {
        // Font failure must leave the editable fallback fully functional.
      })
    measure()
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [variantId, onWidthChange])

  const pastePlainText = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const text = event.clipboardData
      .getData('text/plain')
      .replace(/\r\n?/g, '\n')
    // insertText participates in the browser's native undo history. Avoid
    // rebuilding innerHTML (and the selection) to sanitize clipboard content.
    document.execCommand('insertText', false, text)
  }

  const style: CSSProperties = {
    fontSize: layout.fontSize,
    lineHeight: layout.lineHeight,
    letterSpacing: `${layout.letterSpacing}em`,
    columnCount: layout.columns,
    columnGap: layout.gap,
    columnFill: 'balance',
  }

  return (
    <Box
      minH={0}
      flex='1'
      display='flex'
      flexDirection='column'
      overflow='clip'
      px={{ base: 4, md: 8, lg: 12 }}
      py={{ base: 5, md: 7 }}
      css={{ overscrollBehavior: 'none' }}
    >
      {/* Clip at the content box, not at the outside edge of its padding.
          overflow:clip prevents native caret movement from scrolling it. */}
      <Box ref={viewportRef} flex='1' minH={0} minW={0} overflow='clip'>
        <chakra.div
          ref={editorRef}
          role='textbox'
          transition={'font-variation-settings 0.2s ease-in-out'}
          aria-label='Editable font specimen'
          aria-multiline='true'
          contentEditable='plaintext-only'
          suppressContentEditableWarning
          spellCheck={false}
          tabIndex={0}
          className={variantId.replace(/[^a-zA-Z0-9_-]/g, '-')}
          style={style}
          color='black'
          height='100%'
          width='100%'
          overflow='clip'
          fontWeight='normal'
          fontStyle='normal'
          whiteSpace='pre-wrap'
          overflowWrap='anywhere'
          outline='none'
          borderRadius={0}
          onPaste={pastePlainText}
          onDrop={(event) => event.preventDefault()}
        />
      </Box>
    </Box>
  )
}
