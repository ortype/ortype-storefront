import { FontPage } from '@/components/pages/fonts/FontPage'
import { getAllFontsSlugs } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { toFont } from '@/sanity/lib/normalize'
import { fontQuery } from '@/sanity/lib/queries'
import { Metadata, ResolvingMetadata } from 'next'
import { QueryParams, stegaClean } from 'next-sanity'
import { notFound } from 'next/navigation'
import { FontQueryResult } from 'sanity.types'

type Props = {
  params: Promise<QueryParams>
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  const {
    data: { font },
  }: { data: FontQueryResult } = await sanityFetch({
    query: fontQuery,
    params,
    stega: false,
  })
  const ogImage = false

  return {
    title: font?.name,
    description: font?.version ? font.version : (await parent).version,
    openGraph: ogImage
      ? {
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {},
  } satisfies Metadata
}

export async function generateStaticParams() {
  return await getAllFontsSlugs()
}

export default async function FontSlugRoute({
  params,
}: {
  params: Promise<QueryParams>
}) {
  const { data } = await sanityFetch({
    query: fontQuery,
    params: await params,
  })

  const font = toFont(stegaClean(data.font))

  if (font == null) {
    return notFound()
  }

  return <FontPage data={{ font, moreFonts: [] }} />
}
