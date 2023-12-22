'use client'
import FontWrapper from 'components/FontWrapper'
import { Font, Settings } from 'lib/sanity.queries'
import { lazy, Suspense } from 'react'

const PreviewFontPage = lazy(() => import('components/PreviewFontPage'))

interface PageProps {
  font: Font
  moreFonts: Font[]
  settings?: Settings
  preview: boolean
  token: string | null
}

export default function FontPage(props: PageProps) {
  const { settings, font, moreFonts, preview, token } = props
  if (preview) {
    return (
      <Suspense
        fallback={
          <FontWrapper loading preview font={font} moreFonts={moreFonts} />
        }
      >
        <PreviewFontPage token={token} font={font} moreFonts={moreFonts} />
      </Suspense>
    )
  }

  return <FontWrapper font={font} moreFonts={moreFonts} />
}
