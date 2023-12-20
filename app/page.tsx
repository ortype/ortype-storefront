import IndexPage from 'components/IndexPage'
import { getAllFonts, getAllPosts, getSettings } from 'lib/sanity.client'
import { Font, Post, Settings } from 'lib/sanity.queries'
import { cache } from 'react'

interface DataProps {
  posts: Post[]
  fonts: Font[]
  settings: Settings
}

import Home from './Home'

const getData = cache(async () => {
  const [settings, posts = [], fonts = []] = await Promise.all([
    getSettings(),
    getAllPosts(),
    getAllFonts(),
  ])
  return { settings, posts, fonts }
})

export default async function Page(props) {
  // @TODO: how to access `preview` and `previewData` that were passed to the context by `api/preview`
  // is `next/headers` a direction here?
  const { preview = false, previewData = {} } = props
  const data: DataProps = await getData()
  return <Home preview={preview} token={previewData.token ?? null} {...data} />
}
