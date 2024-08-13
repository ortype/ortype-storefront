import FontWrapper from '@/components/pages/fonts/FontWrapper'
import getMetrics from '@/components/utils/metrics'
import type { FontPagePayload } from '@/types'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'

export interface FontPageProps {
  data: FontPagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function FontPage({ data, encodeDataAttribute }: FontPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  // create metrics
  if (font) {
    font.metrics = getMetrics(font.metafields)
  }

  // data-sanity={encodeDataAttribute?.('coverImage')}
  // data-sanity={encodeDataAttribute?.('duration.start')}
  return font && <FontWrapper font={font} moreFonts={moreFonts} />
}

export default FontPage
