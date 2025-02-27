'use client'

import Image from '@/components/global/Image'
import Date from '@/components/shared/PostDate'
import { Category, Post } from '@/sanity/lib/queries'
import {
  Box,
  Button,
  Card,
  Link as ChakraLink,
  Container,
  Group,
  Heading,
  Spinner,
  Tag,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import Masonry from 'react-masonry-css'
import PostCard from './PostCard'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 500)
    }
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return isVisible ? (
    <Button
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </Button>
  ) : null
}

interface PostsProps {
  posts: Post[]
  categories: Category[]
}

export function Posts({ posts, categories }: PostsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
  const [hasMore, setHasMore] = useState(true)
  const itemsPerLoad = 12
  const filteredPosts =
    selectedCategory === 'all'
      ? posts
      : posts.filter((post) => post.category.slug === selectedCategory)
  // Initialize with first batch of posts
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug)
    setDisplayedPosts([]) // Reset displayed posts
    setHasMore(true)
  }

  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, itemsPerLoad))
  }, [selectedCategory])

  useEffect(() => {
    setDisplayedPosts(posts.slice(0, itemsPerLoad))
  }, [posts])

  const breakpointColumns =
    useBreakpointValue({
      base: 1,
      sm: 2,
      md: 3,
      lg: 3,
    }) || 3

  const breakpointColumnsObj = {
    default: breakpointColumns,
    1100: 3,
    700: 2,
    500: 1,
  }

  const loadMore = () => {
    const currentLength = displayedPosts.length
    const nextPosts = filteredPosts.slice(
      currentLength,
      currentLength + itemsPerLoad
    )

    if (nextPosts.length > 0) {
      setDisplayedPosts((prev) => [...prev, ...nextPosts])
    }

    // Check if we've loaded all posts
    if (currentLength + nextPosts.length >= filteredPosts.length) {
      setHasMore(false)
    }
  }

  const LoadingSpinner = () => (
    <Box className="infinite-scroll-loader">
      <Spinner size="lg" color="gray.500" />
    </Box>
  )

  /*if (!displayedPosts.length) {
    return (
      <Container maxW="container.xl">
        <Box sx={masonryStyles}>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {Array.from({ length: itemsPerLoad }).map((_, i) => (
              <Card.Root key={i} maxW="sm" overflow="hidden">
                <Box height="200px" bg="gray.200" />
                <Card.Body>
                  <Box height="20px" width="80%" bg="gray.200" mb={2} />
                  <Box height="40px" bg="gray.200" />
                </Card.Body>
              </Card.Root>
            ))}
          </Masonry>
        </Box>
      </Container>
    )
  }*/

  return (
    <Container maxW="container.xl">
      <Box mb={6} display="flex" gap={2} flexWrap="wrap">
        <Button
          size="sm"
          variant={selectedCategory === 'all' ? 'solid' : 'outline'}
          onClick={() => handleCategoryChange('all')}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.slug}
            size="sm"
            variant={selectedCategory === category.slug ? 'solid' : 'outline'}
            onClick={() => handleCategoryChange(category.slug)}
          >
            {category.title}
          </Button>
        ))}
      </Box>
      <InfiniteScroll
        dataLength={displayedPosts.length}
        next={loadMore}
        hasMore={hasMore}
        // loader={<LoadingSpinner />}
        loader={<div></div>}
        endMessage={
          <Text textAlign="center" p={4} color="gray.500">
            No more posts to load.
          </Text>
        }
        // Optional: add a scrollThreshold to load earlier
        scrollThreshold={0.8}
        // Style to ensure proper layout
        style={{ overflow: 'hidden' }}
        /*
          onError={() => (
            <Text textAlign="center" color="red.500" p={4}>
              Error loading posts. Please try again later.
            </Text>
          )}
          */
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <Masonry
            key={selectedCategory}
            breakpointCols={breakpointColumnsObj}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {displayedPosts.map((post, index) => (
              <PostCard key={post.slug} post={post} index={index} />
            ))}
          </Masonry>
        </AnimatePresence>
      </InfiniteScroll>
    </Container>
  )
}
