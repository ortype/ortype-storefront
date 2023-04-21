import IndexPage from 'components/IndexPage'
import { usePreview } from 'lib/sanity.preview'
import {
  type Font,
  type Post,
  type Settings,
  indexQuery,
  fontsQuery,
  settingsQuery,
} from 'lib/sanity.queries'

export default function PreviewIndexPage({ token }: { token: null | string }) {
  const posts: Post[] = usePreview(token, indexQuery) || []
  const fonts: Font[] = usePreview(token, fontsQuery) || []
  const settings: Settings = usePreview(token, settingsQuery) || {}

  return <IndexPage preview fonts={fonts} posts={posts} settings={settings} />
}
