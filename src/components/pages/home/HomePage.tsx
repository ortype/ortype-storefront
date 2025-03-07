import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'

import FontList from '@/components/pages/home/FontList'
// import { Header } from '@/components/shared/Header'
import type { HomePagePayload } from '@/types'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function HomePage({ data, encodeDataAttribute }: HomePageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { fonts = [] } = data ?? {}

  return (
    <>
      {/* Header */}
      {/* title && <Header centered title={title} description={overview} />*/}
      {/* Font index */}
      {fonts && fonts.length > 0 && (
        <FontList encodeDataAttribute={encodeDataAttribute} fonts={fonts} />
      )}
    </>
  )
}

export default HomePage
