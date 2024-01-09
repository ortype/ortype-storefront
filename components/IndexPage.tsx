import FontList from '@/components/pages/home/FontList'
import { useApolloClient } from '@apollo/client'
import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import HeroPost from 'components/HeroPost'
import IndexPageHead from 'components/IndexPageHead'
import MoreStories from 'components/MoreStories'
import * as demo from 'lib/demo.data'
import type { Font, Post, Settings } from 'lib/sanity.queries'
import Head from 'next/head'

export interface IndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  fonts: Font[]
  settings: Settings
}

export default function IndexPage(props: IndexPageProps) {
  const { preview, loading, posts, fonts, settings } = props
  const [heroPost, ...morePosts] = posts || []
  const { title = demo.title, description = demo.description } = settings || {}

  const apolloClient = useApolloClient()

  return (
    <>
      <Head>
        <IndexPageHead settings={settings} />
      </Head>
      <Layout preview={preview} loading={loading}>
        <Container>
          <h1>Hello, you're using Apollo Client {apolloClient.version}</h1>
          {fonts.length > 0 && <FontList fonts={fonts} />}
          {/*<BlogHeader title={title} description={description} level={1} />*/}
        </Container>
      </Layout>
    </>
  )
}
