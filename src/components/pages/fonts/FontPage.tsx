import FontWrapper from '@/components/pages/fonts/FontWrapper'
import getMetrics from '@/components/utils/metrics'
import type { FontPagePayload } from '@/types'

export interface FontPageProps {
  data: FontPagePayload | null
}

export function FontPage({ data }: FontPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { font, moreFonts } = data ?? {}

  if (font == null) {
    return null
  }

  // Derive metrics into a new object rather than mutating the `font` prop
  const fontWithMetrics = {
    ...font,
    metrics: getMetrics(font.metafields),
  }

  return <FontWrapper font={fontWithMetrics} moreFonts={moreFonts ?? []} />
}

export default FontPage
