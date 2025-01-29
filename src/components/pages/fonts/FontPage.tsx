import FontWrapper from '@/components/pages/fonts/FontWrapper'
import getMetrics from '@/components/utils/metrics'
import type { FontPagePayload } from '@/types'
import Link from 'next/link'

export interface FontPageProps {
  data: FontPagePayload | null
}

export function FontPage({ data }: FontPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  // create metrics
  if (font) {
    font.metrics = getMetrics(font.metafields)
  }

  return font && <FontWrapper font={font} moreFonts={moreFonts} />
}

export default FontPage
