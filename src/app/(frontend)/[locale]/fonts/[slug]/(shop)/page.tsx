import { FontPage } from '@/components/pages/fonts/FontPage'
import { client } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { fontAndMoreFontsQuery } from '@/sanity/lib/queries'
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
  const { font } = await client.fetch(fontAndMoreFontsQuery, params)
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

const fontSlugs = defineQuery(
  `*[_type == "font" && defined(slug.current)]{"slug": slug.current}`
)

export async function generateStaticParams() {
  const slugs = await client.fetch(fontSlugs)
  return slugs.map(({ slug }) => slug)
}

export default async function FontSlugRoute({
  params,
}: {
  params: Promise<QueryParams>
}) {
  const { data } = await sanityFetch({
    query: fontAndMoreFontsQuery,
    params: await params,
  })

  if (!data?.font) {
    return notFound()
  }

  return <FontPage data={data} />
}
