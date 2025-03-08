'use client'

import Body from '@/components/blocks/body'
import Carousel from '@/components/blocks/carousel'
import Image from '@/components/global/Image'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Category, Post } from '@/sanity/lib/queries'
import {
  Box,
  Card,
  Link as ChakraLink,
  Flex,
  GridItem,
  Group,
  Heading,
  SimpleGrid,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import PostCardTitle from './post-card-title'

const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      className="masonry-item"
      layoutId={`${post.slug}`}
      layout="position"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        layout: {
          type: 'spring',
          damping: 25,
          stiffness: 120,
          duration: 0.3,
        },
        opacity: { duration: 0.2 },
      }}
    >
      <Card.Root maxW="md" overflow="hidden" borderRadius={0} border={'none'}>
        <Card.Body p={0} onClick={() => setOpen(true)} cursor={'pointer'}>
          <Image
            image={post.coverImage}
            style={{ width: '100%', height: 'auto' }}
            sizes={'(max-width: 800px) 100vw, 800px'}
            alt={post.coverImage.asset?.altText || ''}
          />
          {/*<Card.Title>
            <Heading fontWeight={'normal'} fontSize={'xl'}>
              {post.title}
            </Heading>
          </Card.Title>*/}
          {/*        <Card.Description fontSize={'sm'} lineHeight={'1.2'}>
          {post.excerpt}
        </Card.Description>*/}
          {/*<Text mt="2" fontSize={'sm'}>
            <Date dateString={post.date} />
          </Text>*/}
        </Card.Body>
        <Card.Footer pt={'0.5rem'} px={0}>
          {/*post.content && (
            <Button variant="outline" asChild>
              <a href={`/archive/${post?.slug}`}>Learn more</a>
            </Button>
          )*/}

          <Group flex={1}>
            <Tag.Root variant={'outline'} size={'xl'}>
              <Tag.Label>{post.category.title}</Tag.Label>
            </Tag.Root>
            {post.category.title === 'In Use' ? (
              <PostCardTitle
                category={post.category}
                title={post.title ?? ''}
                fonts={post.fonts}
              />
            ) : (
              <Text as={'span'} fontSize={'sm'}>
                {post.title}
              </Text>
            )}
          </Group>
        </Card.Footer>
      </Card.Root>
      <DialogRoot
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        scrollBehavior={'outside'}
        motionPreset={'scale'}
        closeOnEscape={true}
        placement={'center'}
        size={'xl'}
      >
        <DialogContent backdrop={true} borderRadius={5}>
          {/*<DialogHeader>
            <DialogTitle>{post.title}</DialogTitle>
          </DialogHeader>*/}
          <DialogBody p={0} overflow={'hidden'} borderRadius={5}>
            {post.gallery && <Carousel value={{ images: post.gallery }} />}
            {post.content && (
              <SimpleGrid columns={3} gap={'2rem'} mx={'2rem'} mb={'2rem'}>
                <GridItem py={'1rem'}>
                  {/*<Button variant="outline" asChild>
                    <a href={`/archive/${post?.slug}`}>Learn more</a>
                  </Button>*/}
                  <Flex
                    direction={'column'}
                    h={'100%'}
                    justify={'space-between'}
                  >
                    <Heading mb={'0.5rem'} size={'2xl'} fontWeight={'normal'}>
                      {post.title}
                    </Heading>
                    <Group>
                      <Tag.Root variant={'outline'} size={'xl'}>
                        <Tag.Label>{post.category.title}</Tag.Label>
                      </Tag.Root>
                      {post.category.title === 'Custom' ? (
                        <Text as={'span'} fontSize={'sm'}>
                          {post.title}
                        </Text>
                      ) : (
                        post.fonts?.map(({ font }, index, array) => (
                          <Box
                            as={'span'}
                            key={font.slug}
                            whiteSpace={'nowrap'}
                          >
                            <ChakraLink as={Link} href={`fonts/${font.slug}`}>
                              {font.shortName}
                            </ChakraLink>
                            {index < array.length - 1 && ', '}
                          </Box>
                        ))
                      )}
                    </Group>
                  </Flex>
                </GridItem>
                <GridItem
                  colSpan={2}
                  py={'1rem'}
                  columnCount={'2'}
                  columnGap={'2rem'}
                  display={'block'}
                >
                  <Body value={post.content} />
                </GridItem>
              </SimpleGrid>
            )}
          </DialogBody>
          {/*post.content && (
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline" asChild>
                  <a href={`/archive/${post?.slug}`}>Learn more</a>
                </Button>
              </DialogActionTrigger>
            </DialogFooter>
            )*/}
          <DialogCloseTrigger insetEnd={'-12'} top={0} bg="bg" />
        </DialogContent>
      </DialogRoot>
    </motion.div>
  )
}
export default PostCard
