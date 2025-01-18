import { PostPage } from '@/components/pages/posts/PostPage'
import { postAndMoreStoriesQuery } from '@/lib/sanity.queries'
import { resolveOpenGraphImage } from '@/lib/sanity.utils'
import { sanityFetch } from '@/sanity/lib/fetch'
import { toPlainText } from '@portabletext/react'
import { defineQuery } from 'groq'
import { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { post } = await sanityFetch({
    query: postAndMoreStoriesQuery,
    params,
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(post?.coverImage)

  return {
    authors: post?.author?.name ? [{ name: post?.author?.name }] : [],
    title: post?.title,
    description: post?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

const postSlugs = defineQuery(
  `*[_type == "post" && defined(slug.current)]{"slug": slug.current}`
)

export const dynamicParams = true // Allow dynamic routes not included in generateStaticParams

/*
export async function generateStaticParams() {
  return await sanityFetch({
    query: postSlugs,
    perspective: 'published',
    stega: false,
  })
}
*/

export default async function PostSlugRoute({ params }: Props) {
  const data = await sanityFetch({ query: postAndMoreStoriesQuery, params })

  if (!data?.post) {
    return notFound()
  }

  return <PostPage data={data} />
}
