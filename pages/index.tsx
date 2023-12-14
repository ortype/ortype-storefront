import IndexPage from 'components/IndexPage'
import { getAllFonts, getAllPosts, getSettings } from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import { lazy, Suspense } from 'react'

const PreviewIndexPage = lazy(() => import('components/PreviewIndexPage'))

interface PageProps {
  posts: Post[]
  fonts: Font[]
  settings: Settings
  preview: boolean
  token: string | null
}

interface Query {
  [key: string]: string
}

interface PreviewData {
  token?: string
}

export default function Page(props: PageProps) {
  const { posts, fonts, settings, preview, token } = props

  if (preview) {
    return (
      <Suspense
        fallback={
          <IndexPage
            loading
            preview
            fonts={fonts}
            posts={posts}
            settings={settings}
          />
        }
      >
        <PreviewIndexPage token={token} />
      </Suspense>
    )
  }

  return <IndexPage fonts={fonts} posts={posts} settings={settings} />
}

export const getStaticProps: GetStaticProps<
  PageProps,
  Query,
  PreviewData
> = async (ctx) => {
  const { preview = false, previewData = {} } = ctx

  const [settings, posts = [], fonts = []] = await Promise.all([
    getSettings(),
    getAllPosts(),
    getAllFonts(),
  ])

  return {
    props: {
      posts,
      fonts,
      settings,
      preview,
      token: previewData.token ?? null,
    },
  }
}
