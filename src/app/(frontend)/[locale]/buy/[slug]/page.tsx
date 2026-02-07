import BuyPage from './buy-slug'
import { client, getAllFontsSlugs } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { buyFontsQuery, fontQuery } from '@/sanity/lib/queries'
import { toPlainText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { defineQuery, QueryParams } from 'next-sanity'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { font } = await client.fetch(fontQuery, params)
  const ogImage = false

  return {
    title: font?.name,
    description: font?.version
      ? toPlainText(font.version)
      : (await parent).version,
    openGraph: ogImage
      ? {
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {},
  } satisfies Metadata
}

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return await getAllFontsSlugs()
}

export default async function BuySlugRoute({
  params,
}: {
  params: Promise<QueryParams>
}) {
  const { data } = await sanityFetch({
    query: buyFontsQuery,
    params: await params,
  })

  if (!data?.font || !data?.moreFonts) {
    return notFound()
  }

  return <BuyPage data={data} />
}
