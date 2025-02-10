import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'

// import { CustomPortableText } from '@/components/shared/CustomPortableText'
// import { Header } from '@/components/shared/Header'
// import ImageBox from '@/components/shared/ImageBox'
import { Container, Heading } from '@chakra-ui/react'
import Head from 'next/head'
// import BlogHeader from './BlogHeader'
import MoreStories from './MoreStories'
import PostBody from './PostBody'
import PostHeader from './PostHeader'
// import PostPageHead from './PostPageHead'
// import { notFound } from 'next/navigation'

import type { Post, PostPagePayload } from '@/types'

export interface PostPageProps {
  data: PostPagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

const NO_POSTS: Post[] = []

export function PostPage({ data, encodeDataAttribute }: PostPageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { post, morePosts = NO_POSTS } = data ?? {}

  return (
    <>
      <Head>{/*<PostPageHead settings={settings} post={data} />*/}</Head>
      <Container>
        {/*<BlogHeader title={post.title} level={2} />*/}
        {!post ? (
          <Heading size={'xl'} fontWeight={'normal'}>
            {'Loading...'}
          </Heading>
        ) : (
          <>
            <article>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                excerpt={post.excerpt}
              />
              <PostBody content={post.content} />
            </article>
            {morePosts?.length > 0 && <MoreStories posts={morePosts} />}
          </>
        )}
      </Container>
    </>
  )
}

export default PostPage
