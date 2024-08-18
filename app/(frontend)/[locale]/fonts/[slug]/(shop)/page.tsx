import { toPlainText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { FontPage } from '@/components/pages/fonts/FontPage'
import { sanityFetch } from '@/sanity/lib/fetch'
import { resolveOpenGraphImage } from '@/lib/sanity.utils'
import { fontAndMoreFontsQuery } from '@/lib/sanity.queries'
import { defineQuery } from 'groq'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { font } = await sanityFetch({
    query: fontAndMoreFontsQuery,
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

const fontSlugs = defineQuery(
  `*[_type == "font" && defined(slug.current)]{"slug": slug.current}`
)

export async function generateStaticParams() {
  return await sanityFetch({
    query: fontSlugs,
    perspective: 'published',
    stega: false,
  })
}

export default async function FontSlugRoute({ params }: Props) {
  const [data] = await Promise.all([
    sanityFetch({ query: fontAndMoreFontsQuery, params }),
  ])

  if (!data?.font) {
    return notFound()
  }

  return <FontPage data={data} />
}
