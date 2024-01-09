import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'
import type { FontPagePayload } from '@/types'
import FontWrapper from '@/components/FontWrapper'

export interface FontPageProps {
  data: FontPagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function FontPage({ data, encodeDataAttribute }: FontPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  // data-sanity={encodeDataAttribute?.('coverImage')}
  // data-sanity={encodeDataAttribute?.('duration.start')}
  return <FontWrapper font={font} moreFonts={moreFonts} />
}

export default FontPage
