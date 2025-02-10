import Avatar from '@/components/shared/AuthorAvatar'
import CoverImage from '@/components/shared/CoverImage'
import Date from '@/components/shared/PostDate'
import type { Post } from '@/sanity/lib/queries'
import { Box, Heading, VStack } from '@chakra-ui/react'

export default function PostHeader(
  props: Pick<Post, 'title' | 'coverImage' | 'date' | 'excerpt' | 'slug'>
) {
  const { title, coverImage, date, excerpt, slug } = props
  return (
    <VStack textAlign={'center'} gap={'2'}>
      <Heading size={'2xl'} fontWeight={'normal'}>
        {title}
      </Heading>
      <Heading size={'2xl'} fontWeight={'normal'}>
        {excerpt}
      </Heading>
      <CoverImage title={title} image={coverImage} priority slug={slug} />
    </VStack>
  )
}
