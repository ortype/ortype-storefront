import { Posts } from '@/components/pages/posts/Posts'
import { sanityFetch } from '@/sanity/lib/live'
import { Post, categoryFiters, postsQuery } from '@/sanity/lib/queries'
import { Box, Spinner } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

interface Category {
  _id: string
  title: string
  slug: string
}

// A simple seeded random number generator (Mulberry32)
const mulberry32 = (seed: number) => {
  return () => {
    let s = (seed += 0x6d2b79f5)
    s = Math.imul(s ^ (s >>> 15), 1 | s)
    s = s + Math.imul(s ^ (s >>> 7), 61 | s)
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296
  }
}

// Convert string to a numeric seed
const hashString = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Fisher-Yates (Knuth) shuffle algorithm with seed support
const shuffleArrayWithSeed = (array: Post[], seed: string | number): Post[] => {
  // Create a copy of the array to avoid modifying the original
  const shuffledArray = [...array]

  // Convert string seed to number if needed
  const numericSeed = typeof seed === 'string' ? hashString(seed) : seed

  // Initialize seeded random number generator
  const random = mulberry32(numericSeed)

  // Start from the last element and swap with a random element before it
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate random index between 0 and i (inclusive) using seeded generator
    const j = Math.floor(random() * (i + 1))
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

  if (!posts) {
    return notFound()
  }

  const today = new Date().toISOString().split('T')[0]
  const shuffledPosts = shuffleArrayWithSeed(posts, today)

  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" p={8}>
          <Spinner size="xl" />
        </Box>
      }
    >
      <Posts posts={shuffledPosts} categories={categories} />
    </Suspense>
  )
}
