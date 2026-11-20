'use client'

import { apiVersion } from '@/sanity/env'
import { bookModulePreviewQuery } from '@/sanity/lib/queries'
import type { Book, ModuleBook } from '@/types'
import { useClient, type PreviewProps } from 'sanity'
import useSWR from 'swr'
import BookPreviewMedia from './book-preview-media'
import useBookPreviewFont from './use-book-preview-font'

type Selection = Pick<Book, 'fontId' | 'variantId'> & {
  bookId?: string
  config?: ModuleBook['config']
}

// Previews receive only preview.select's values, not the full array item.
// Async loading stays here, never inside the schema's synchronous prepare().
export default function BookModulePreview(props: PreviewProps) {
  const { bookId, fontId, variantId, config } = props as PreviewProps &
    Selection
  const client = useClient({ apiVersion })
  const { projectId, dataset } = client.config()
  const snapshotKey = config?.snapshotKey ?? ''
  const side = config?.display === 'recto' ? 'recto' : 'verso'
  const { font, defaultVariantId } = useBookPreviewFont(fontId)
  const { data, error } = useSWR(
    bookId
      ? ['book-module-preview', projectId, dataset, bookId, snapshotKey]
      : null,
    () =>
      client.fetch(
        bookModulePreviewQuery,
        { bookId: bookId!, snapshotKey },
        { perspective: 'published', useCdn: false }
      )
  )
  const spread = data?.snapshot?.spread
  const status = error
    ? 'Preview unavailable'
    : snapshotKey
      ? data && !spread
        ? 'Selected snapshot unavailable'
        : 'Selected snapshot'
      : 'Unpinned · first-snapshot preview'

  return props.renderDefault({
    ...props,
    title: props.title || 'Book',
    subtitle: `${side === 'verso' ? 'Verso' : 'Recto'} · ${status}`,
    media: (
      <BookPreviewMedia
        spread={spread}
        font={font}
        defaultVariantId={variantId ?? defaultVariantId}
        side={side}
      />
    ),
  })
}
