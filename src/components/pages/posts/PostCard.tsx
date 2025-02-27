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
  Button,
  Card,
  Link as ChakraLink,
  Grid,
  GridItem,
  Group,
  Tag,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'

const PostCard = ({ post, index }: { post: Post; index: number }) => {
  const [open, setOpen] = useState(false)
  return (
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
      <Card.Root
        maxW="md"
        overflow="hidden"
        onClick={() => setOpen(true)}
        cursor={'pointer'}
        borderRadius={0}
        border={'none'}
      >
        <Card.Body p={0}>
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
                <Box as={'span'} key={font.slug} whiteSpace={'nowrap'}>
                  <ChakraLink as={Link} href={`fonts/${font.slug}`}>
                    {font.shortName}
                  </ChakraLink>
                  {index < array.length - 1 && ', '}
                </Box>
              ))
            )}
          </Group>
        </Card.Footer>
      </Card.Root>
      <DialogRoot
        lazyMount
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        scrollBehavior="outside"
        motionPreset="slide-in-bottom"
        closeOnEscape={true}
        placement={'center'}
        size={'md'}
      >
        <DialogContent backdrop={true} borderRadius={0}>
          {/*<DialogHeader>
            <DialogTitle>{post.title}</DialogTitle>
          </DialogHeader>*/}
          <DialogBody p={0}>
            <Grid
              gap={'2rem'}
              gridRowGap={0}
              templateColumns={['repeat(8, 1fr)', null]}
            >
              {post.gallery && <Carousel value={{ images: post.gallery }} />}
              {post.content && (
                <GridItem gridColumn={'1/9'} p={'1rem'}>
                  <Body value={post.content} />
                </GridItem>
              )}
            </Grid>
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
          <DialogCloseTrigger top="0" insetEnd="-12" bg="bg" />
        </DialogContent>
      </DialogRoot>
    </motion.div>
  )
}
export default PostCard
