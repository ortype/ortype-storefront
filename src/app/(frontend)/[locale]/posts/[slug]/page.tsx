import { PostPage } from '@/components/pages/posts/PostPage'
import { client } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { postAndMoreStoriesQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { Metadata, ResolvingMetadata } from 'next'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await client.fetch(postAndMoreStoriesQuery, params)
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

export const dynamic = 'force-dynamic'

const postSlugs = defineQuery(
  `*[_type == "post" && defined(slug.current)]{"slug": slug.current}`
)

export async function generateStaticParams() {
  const slugs = await client.fetch(postSlugs)
  return slugs.map((slug) => slug)
}

export default async function PostSlugRoute({ params }: Props) {
  const { data } = await sanityFetch({
    query: postAndMoreStoriesQuery,
    params: await params,
  })

  if (!data?.post) {
    return notFound()
  }

  return <PostPage data={data} />
}
