import PostPage from 'components/PostPage'
import {
  getAllPostsSlugs,
  getPostAndMoreStories,
  getSettings,
} from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { cache, lazy, Suspense } from 'react'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllPostsSlugs()
  return slugs?.map(({ slug }) => `/posts/${slug}`) || []
}

const getData = cache(async ({ previewData, params }) => {
  const token = previewData.token

  const [settings, { post, morePosts }] = await Promise.all([
    getSettings(),
    getPostAndMoreStories(params.slug, token),
  ])

  if (!post) {
    return {
      notFound: true,
    }
  }

  return {
    post,
    morePosts,
    settings,
  }
})

const PreviewPostPage = lazy(() => import('components/PreviewPostPage'))

interface DataProps {
  posts: Post[]
  morePosts: Post[]
  settings?: Settings
} // @TODO: OR `notFound: Boolean`

interface Query {
  [key: string]: string
}

interface PreviewData {
  token?: string
}

export default async function ProjectSlugRoute(props) {
  const { preview = false, previewData = {}, params = {} } = props
  // @TODO: how to access `preview` and `previewData` that were passed to the context by `api/preview`
  // is `next/headers` a direction here?
  const { settings, post, morePosts }: DataProps = await getData({
    previewData,
    params,
  })

  if (preview) {
    return (
      <Suspense
        fallback={
          <PostPage
            loading
            preview
            post={post}
            morePosts={morePosts}
            settings={settings}
          />
        }
      >
        <PreviewPostPage
          token={token}
          post={post}
          morePosts={morePosts}
          settings={settings}
        />
      </Suspense>
    )
  }

  return <PostPage post={post} morePosts={morePosts} settings={settings} />
}
