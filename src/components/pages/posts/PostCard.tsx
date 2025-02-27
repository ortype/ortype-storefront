'use client'

import Image from '@/components/global/Image'
import { Category, Post } from '@/sanity/lib/queries'
import {
  Button,
  Card,
  Link as ChakraLink,
  Group,
  Tag,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PostCard = ({ post, index }: { post: Post; index: number }) => (
  <motion.div
    className="masonry-item"
    layout="position"
    layoutId={`${post.slug}-${index}`}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      duration: 0.4,
      ease: 'easeOut',
      layout: { duration: 0.35, type: 'tween', ease: 'easeInOut' },
    }}
  >
    <Card.Root maxW="sm" overflow="hidden">
      <Image
        image={post.coverImage}
        style={{ width: '100%', height: 'auto' }}
        sizes={'(max-width: 800px) 100vw, 800px'}
        alt={post.coverImage.asset?.altText || ''}
        // loading="lazy" // Enable lazy loading for images
      />
      <Card.Body gap="2">
        {/*<Card.Title>
            <Heading fontWeight={'normal'} fontSize={'xl'}>
              {post.title}
            </Heading>
          </Card.Title>*/}
        <Card.Description fontSize={'sm'} lineHeight={'1.2'}>
          {post.excerpt}
        </Card.Description>
        {/*<Text mt="2" fontSize={'sm'}>
            <Date dateString={post.date} />
          </Text>*/}
      </Card.Body>
      <Card.Footer gap="2">
        {post.content && (
          <Button variant="outline" asChild>
            <a href={`/archive/${post?.slug}`}>Learn more</a>
          </Button>
        )}

        <Group>
          <Tag.Root>
            <Tag.Label>{post.category.title}</Tag.Label>
          </Tag.Root>
          {post.category.title === 'Custom' ? (
            <Text as={'span'} fontSize={'sm'}>
              {post.title}
            </Text>
          ) : (
            post.fonts?.map(({ font }) => (
              <ChakraLink key={font.slug} as={Link} href={`fonts/${font.slug}`}>
                {font.shortName}
              </ChakraLink>
            ))
          )}
        </Group>
      </Card.Footer>
    </Card.Root>
  </motion.div>
)

export default PostCard
