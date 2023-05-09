import { PreviewSuspense } from '@sanity/preview-kit'
import {
  getAllFontsSlugs,
  getFontAndMoreFonts,
  getSettings,
} from 'lib/sanity.client'
import { Font, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import { lazy } from 'react'
import TokenWrapper from 'components/TokenWrapper'

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
  const {
    settings,
    font,
    moreFonts,
    preview,
    token,
    clientId,
    marketId,
    endpoint,
  } = props
  console.log('font: ', font)

  // 401 error on prices
  // or-type-mvp.commercelayer.io/api/prices?page[size]=10&filter[q][sku_code_in]=fontVariant-MZx7wg6SOhLFDN2ktJPDF
  // TOKEN: eyJhbGciOiJIUzUxMiJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJleVdveEZ4bU55Iiwic2x1ZyI6Im9yLXR5cGUtbXZwIiwiZW50ZXJwcmlzZSI6ZmFsc2V9LCJhcHBsaWNhdGlvbiI6eyJpZCI6ImJwQVJxaUthbE4iLCJraW5kIjoic2FsZXNfY2hhbm5lbCIsInB1YmxpYyI6dHJ1ZX0sInRlc3QiOnRydWUsImV4cCI6MTY4MTgzODAxMywicmFuZCI6MC45NzM0NDQyNTM4NTEwMTIzfQ.UYx5OXednIDK1X25aduTLZwzWTx3ZynQYqlipG9kUM2Gvp2humb7Uv1PKGg9L4bIV0rkSrNBZWTDUCLw8EwBJA
  // Can we test this with postman?
  // fontVariant-60uB28bO8CCXnukEgvmha
  // postman returns a 401 error invalid token (token is correct now in webapp, but postman sends 401)

  if (preview) {
    return (
      <PreviewSuspense
        fallback={
          <TokenWrapper
            loading
            preview
            font={font}
            clientId={clientId}
            marketId={marketId}
            endpoint={endpoint}
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
    <TokenWrapper
      font={font}
      moreFonts={moreFonts}
      settings={settings}
      clientId={clientId}
      marketId={marketId}
      endpoint={endpoint}
    />
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

  // 1. add font variants to the query
  // 2. request price data from CL for variants
  // 3. create Add to Cart functionality

  console.log(process.env.CL_CLIENT_ID, process.env.CL_ENDPOINT)

  return {
    props: {
      font,
      moreFonts,
      settings,
      preview,
      clientId: process.env.CL_CLIENT_ID,
      endpoint: process.env.CL_ENDPOINT,
      marketId: 'market:12213',
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
