import FontList from '@/components/pages/home/FontList'
// import { Header } from '@/components/shared/Header'
import type { HomePagePayload } from '@/types'
import { OnAir } from './on-air'

export interface HomePageProps {
  data: HomePagePayload | null
}

export function HomePage({ data }: HomePageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { fonts = [] } = data ?? {}

  return (
    <>
      {/* Header */}
      {/* title && <Header centered title={title} description={overview} />*/}
      {/* Font index */}
      {fonts && fonts.length > 0 && <FontList fonts={fonts} />}
      <OnAir />
    </>
  )
}

export default HomePage
