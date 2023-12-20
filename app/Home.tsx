'use client'
import { lazy, Suspense } from 'react'
import IndexPage from 'components/IndexPage'
import { Post, Font, Settings } from 'lib/sanity.queries'

interface PageProps {
  posts: Post[]
  fonts: Font[]
  settings: Settings
  preview: boolean
  token: string | null
}

const PreviewIndexPage = lazy(() => import('components/PreviewIndexPage'))

export default function Home(props: PageProps) {
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
