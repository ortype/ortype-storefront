import { toPlainText } from '@portabletext/react'
import { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { FontPage } from '@/components/pages/fonts/FontPage'
import { generateStaticSlugs } from '@/sanity/loader/generateStaticSlugs'
import { loadFont } from '@/sanity/loader/loadQuery'
import { urlForOpenGraphImage } from 'lib/sanity.utils' // from '@/sanity/lib/utils'
const FontPreview = dynamic(
  () => import('@/components/pages/fonts/FontPreview')
)

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: font } = await loadFont(params.slug)
  const ogImage = false // urlForOpenGraphImage(font?.coverImage)

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
  }
}

export function generateStaticParams() {
  return generateStaticSlugs('font')
}

export default async function FontSlugRoute({ params }: Props) {
  const initial = await loadFont(params.slug)

  if (draftMode().isEnabled) {
    return <FontPreview params={params} initial={initial} />
  }

  if (!initial.data) {
    notFound()
  }

  return <FontPage data={initial.data} />
}
