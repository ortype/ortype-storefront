'use client'

import type { Book } from '@/types'
import { useContext } from 'react'
import type { PreviewProps } from 'sanity'
import BookPreviewMedia from './book-preview-media'
import { BookSnapshotPreviewContext } from './book-snapshots-input'

type Snapshot = NonNullable<Book['snapshots']>[number]

// Each item previews its own JSON, not the book's first or selected snapshot.
// The date is a label only; _key remains the snapshot's durable identity.
export default function BookSnapshotPreview(props: PreviewProps) {
  const { spread, createdAt } = props as PreviewProps &
    Pick<Snapshot, 'spread' | 'createdAt'>
  const font = useContext(BookSnapshotPreviewContext)
  const date = createdAt ? new Date(createdAt) : null
  const title =
    date && Number.isFinite(date.getTime())
      ? date.toLocaleString()
      : 'Undated snapshot'
  return props.renderDefault({
    ...props,
    title,
    subtitle: 'Verso / Recto',
    media: <BookPreviewMedia spread={spread} {...font} />,
  })
}
