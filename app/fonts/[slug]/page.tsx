import {
  getAllFontsSlugs,
  getFontAndMoreFonts,
  getSettings,
} from 'lib/sanity.client'
import { Font, Settings } from 'lib/sanity.queries'
import { cache } from 'react'
import FontPage from './Font'

interface DataProps {
  fonts: Font[]
  moreFonts: Font[]
  settings?: Settings
} // @TODO: OR `notFound: Boolean`

interface Query {
  [key: string]: string
}

interface PreviewData {
  token?: string
}

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllFontsSlugs()
  return slugs?.map(({ slug }) => `/fonts/${slug}`) || []
}

const getData = cache(async ({ previewData, params }) => {
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
    font,
    moreFonts,
    settings,
  }
})

export default async function Page(props) {
  const { preview = false, previewData = {}, params = {} } = props
  // @TODO: how to access `preview` and `previewData` that were passed to the context by `api/preview`
  // is `next/headers` a direction here?
  const data: DataProps = await getData({ previewData, params })
  return (
    <FontPage preview={preview} token={previewData.token ?? null} {...data} />
  )
}
