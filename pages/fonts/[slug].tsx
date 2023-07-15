import { PreviewSuspense } from '@sanity/preview-kit'
import FontWrapper from 'components/FontWrapper'
import {
  getAllFontsSlugs,
  getFontAndMoreFonts,
  getSettings,
} from 'lib/sanity.client'
import { Font, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import { lazy } from 'react'

const PreviewFontPage = lazy(() => import('components/PreviewFontPage'))

interface PageProps {
  font: Font
  moreFonts: Font[]
  settings?: Settings
  preview: boolean
  token: string | null
}

interface Query {
  [key: string]: string
}

interface PreviewData {
  token?: string
}

export default function FontSlugRoute(props: PageProps) {
  const { settings, font, moreFonts, preview, token } = props
  if (preview) {
    return (
      <PreviewSuspense
        fallback={
          <FontWrapper
            loading
            preview
            font={font}
            moreFonts={moreFonts}
            settings={settings}
          />
        }
      >
        <PreviewFontPage
          token={token}
          font={font}
          moreFonts={moreFonts}
          settings={settings}
        />
      </PreviewSuspense>
    )
  }

  return (
    <FontWrapper font={font} moreFonts={moreFonts} siteSettings={settings} />
  )
}

export const getStaticProps: GetStaticProps<
  PageProps,
  Query,
  PreviewData
> = async (ctx) => {
  const { preview = false, previewData = {}, params = {} } = ctx

  const token = previewData.token

  const [settings, { font, moreFonts }] = await Promise.all([
    getSettings(),
    getFontAndMoreFonts(params.slug, token),
  ])

  if (!font) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      font,
      moreFonts,
      settings,
      preview,
      token: previewData.token ?? null,
    },
  }
}

export const getStaticPaths = async () => {
  const slugs = await getAllFontsSlugs()
  return {
    paths: slugs?.map(({ slug }) => `/fonts/${slug}`) || [],
    fallback: false,
  }
}
