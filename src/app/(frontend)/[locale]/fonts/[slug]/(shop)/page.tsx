import { FontPage } from '@/components/pages/fonts/FontPage'
import { getAllFontsSlugs } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { fontQuery } from '@/sanity/lib/queries'
import { toPlainText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import { QueryParams } from 'next-sanity'
import { notFound } from 'next/navigation'
import { FontQueryResult } from 'sanity.types'

type Props = {
  params: Promise<QueryParams>
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params
  const { data: font }: { data: FontQueryResult } = await sanityFetch({
    query: fontQuery,
    params,
    stega: false,
  })
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

  if (!data?.font) {
    return notFound()
  }

  return <FontPage data={data} />
}
