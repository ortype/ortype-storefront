import { sanityFetch } from '@/sanity/lib/live'
import { Posts } from '@/components/pages/posts/Posts'
import { postsQuery } from '@/sanity/lib/queries'

export default async function Page() {
  const { data: posts } = await sanityFetch({
    query: postsQuery,
  })

  return <Posts posts={posts} />
}
