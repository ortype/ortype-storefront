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

// Fisher-Yates (Knuth) shuffle algorithm
const shuffleArray = (array: Post[]): Post[] => {
  // Create a copy of the array to avoid modifying the original
  const shuffledArray = [...array]

  // Start from the last element and swap with a random element before it
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1))
    // Swap elements at i and j
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
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
      <Posts posts={shuffleArray(posts)} categories={categories} />
    </Suspense>
  )
}
