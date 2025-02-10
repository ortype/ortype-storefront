'use client'

import Image from '@/components/global/Image'
import Date from '@/components/shared/PostDate'
import { Post } from '@/sanity/lib/queries'
import { Button, Card, Container, Heading, Text, Wrap } from '@chakra-ui/react'

export function Posts({ posts }: { posts: Post[] }) {
  return (
    <Container>
      <Wrap gap="5">
        {posts.map((post) => (
          <Card.Root maxW="sm" overflow="hidden">
            <Image
              image={post.coverImage}
              style={{ width: 'auto', height: '100%' }}
              sizes={'(max-width: 800px) 100vw, 800px'}
            />
            <Card.Body gap="2">
              <Card.Title>
                <Heading fontWeight={'normal'} fontSize={'xl'}>
                  {post.title}
                </Heading>
              </Card.Title>
              <Card.Description fontSize={'sm'} lineHeight={'1.2'}>
                {post.excerpt}
              </Card.Description>
              <Text mt="2" fontSize={'sm'}>
                <Date dateString={post.date} />
              </Text>
            </Card.Body>
            <Card.Footer gap="2">
              <Button variant="outline" asChild>
                <a href={`/archive/${post?.slug}`}>Learn more</a>
              </Button>
            </Card.Footer>
          </Card.Root>
        ))}
      </Wrap>
    </Container>
  )
}
