'use client'

import { type QueryResponseInitial } from '@sanity/react-loader'

import { useQuery } from '@/sanity/loader/useQuery'
import { PostPagePayload } from '@/types'
import { postAndMoreStoriesQuery } from 'lib/sanity.queries' //'@/sanity/lib/queries'

import PostPage from './PostPage'

type Props = {
  params: { slug: string }
  initial: QueryResponseInitial<PostPagePayload | null>
}

export default function PostPreview(props: Props) {
  const { params, initial } = props
  const { data, encodeDataAttribute } = useQuery<PostPagePayload | null>(
    postAndMoreStoriesQuery,
    params,
    { initial }
  )

  return <PostPage data={data!} encodeDataAttribute={encodeDataAttribute} />
}
