'use client'

import type { BookRenderFont } from '@/components/book/book-page-content'
import getMetrics from '@/components/utils/metrics'
import { apiVersion } from '@/sanity/env'
import { bookPreviewFontQuery } from '@/sanity/lib/queries'
import { useMemo } from 'react'
import { useClient } from 'sanity'
import useSWR from 'swr'

export default function useBookPreviewFont(fontId?: string) {
  const client = useClient({ apiVersion })
  const { projectId, dataset } = client.config()
  // Include the dataset identity so previews from separate Studio workspaces
  // cannot reuse another workspace's cached typography data.
  const { data } = useSWR(
    fontId ? ['book-preview-font', projectId, dataset, fontId] : null,
    () =>
      client.fetch(
        bookPreviewFontQuery,
        { fontId: fontId! },
        { perspective: 'published', useCdn: false }
      )
  )
  const font = useMemo<BookRenderFont | null>(() => {
    if (!data) return null
    return {
      shortName: data.shortName,
      metrics: getMetrics(data.metafields ?? []),
      variants: (data.variants ?? []).filter((variant) => variant !== null),
    }
  }, [data])
  return { font, defaultVariantId: data?.defaultVariant?._id ?? '' }
}
