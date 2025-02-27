import { Posts } from '@/components/pages/posts/Posts'
import { sanityFetch } from '@/sanity/lib/live'
import { Post, categoryFiters, postsQuery } from '@/sanity/lib/queries'
import { Box, Spinner } from '@chakra-ui/react'
import { Suspense } from 'react'

interface Category {
  _id: string
  title: string
  slug: string
}

export default async function Page() {
  const [{ data: posts }, { data: categories }] = await Promise.all([
    sanityFetch({
      query: postsQuery,
    }),
    sanityFetch({
      query: categoryFiters,
    }),
  ])
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" p={8}>
          <Spinner size="xl" />
        </Box>
      }
    >
      <Posts posts={posts} categories={categories} />
    </Suspense>
  )
}
