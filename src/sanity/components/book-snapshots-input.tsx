'use client'

import type { BookRenderFont } from '@/components/book/book-page-content'
import { createContext } from 'react'
import { useFormValue, type ArrayOfObjectsInputProps } from 'sanity'
import useBookPreviewFont from './use-book-preview-font'

export const BookSnapshotPreviewContext = createContext<{
  font: BookRenderFont | null
  defaultVariantId: string
}>({ font: null, defaultVariantId: '' })

// Array-item previews cannot select fields above themselves. Read the book's
// font once at the array boundary and keep Sanity's native array controls intact.
export default function BookSnapshotsInput(props: ArrayOfObjectsInputProps) {
  const fontId = useFormValue(['fontId'])
  const variantId = useFormValue(['variantId'])
  const { font, defaultVariantId } = useBookPreviewFont(
    typeof fontId === 'string' ? fontId : undefined
  )
  return (
    <BookSnapshotPreviewContext.Provider
      value={{
        font,
        defaultVariantId:
          typeof variantId === 'string' ? variantId : defaultVariantId,
      }}
    >
      {props.renderDefault(props)}
    </BookSnapshotPreviewContext.Provider>
  )
}
