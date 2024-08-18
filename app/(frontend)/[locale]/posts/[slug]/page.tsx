import { toPlainText } from '@portabletext/react'
import { defineQuery } from 'groq'
import { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { PostPage } from '@/components/pages/posts/PostPage'
import { sanityFetch } from '@/sanity/lib/fetch'
import { resolveOpenGraphImage } from '@/lib/sanity.utils'
import { postAndMoreStoriesQuery } from '@/lib/sanity.queries'

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

export async function generateStaticParams() {
  return await sanityFetch({
    query: postSlugs,
    perspective: 'published',
    stega: false,
  })
}

export default async function PostSlugRoute({ params }: Props) {
  const [data] = await Promise.all([
    sanityFetch({ query: postAndMoreStoriesQuery, params }),
  ])

  if (!data?.post) {
    return notFound()
  }

  return <PostPage data={data} />
}
