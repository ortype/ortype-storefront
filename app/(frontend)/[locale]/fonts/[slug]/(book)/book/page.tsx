import { auth, BASE_PATH } from '@/lib/auth'
import { GET_BOOK_LAYOUTS } from 'graphql/queries'
import { createApolloClient } from 'hooks/useApollo'
import {
  getAllFontsSlugs,
  getFontAndMoreFonts,
  getVisibleFonts,
} from 'lib/sanity.client'
import { Font } from 'lib/sanity.queries'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache as ReactCache } from 'react'
import BookPage from './BookPage'

export const dynamicParams = false
// export const dynamic = 'force-dynamic'

// @TODO: look at replacing with '@/sanity/loader/generateStaticSlugs'
/*
// 
// `generateStaticParams` produces `HTTP status 429: Too Many Requests digest: '1272864709' 
// removing it fixes the issue, so maybe it is related to this discussion
// https://stackoverflow.com/questions/76305664/next-js-error-in-production-mode-digest-1782794309
export async function generateStaticParams() {
  const slugs = await getAllFontsSlugs()
  return slugs?.map(({ slug }) => `/fonts/${slug}/book`) || []
}
*/

// @TODO: look into next data layer caching to reduce requests
const getData = ReactCache(async ({ slug }) => {
  const [fonts = [], { font }] = await Promise.all([
    getVisibleFonts(),
    getFontAndMoreFonts(slug),
  ])

  const client = createApolloClient()
  // @TODO: since this is just the initial layout option, we could request all layouts and
  // match the first fontId, or fallback to a template, or unassigned (but with one query)
  if (font) {
    const { data: assignedLayouts } = await client.query({
      query: GET_BOOK_LAYOUTS,
      variables: { fontId: font._id },
    })
    const { data: templateLayouts } = await client.query({
      query: GET_BOOK_LAYOUTS,
      variables: { isTemplate: true },
    })
    const { data: unassignedLayouts } = await client.query({
      query: GET_BOOK_LAYOUTS,
      variables: { isTemplate: false },
    })

    let initialBookLayout
    if (assignedLayouts.bookLayouts.nodes.length === 0) {
      initialBookLayout =
        templateLayouts.bookLayouts.nodes[0] ||
        unassignedLayouts.bookLayouts.nodes[0]
    } else {
      initialBookLayout = assignedLayouts.bookLayouts.nodes[0]
    }

    return {
      fonts,
      font,
      initialBookLayout,
      bookLayouts: {
        assigned: assignedLayouts.bookLayouts.nodes,
        template: templateLayouts.bookLayouts.nodes,
        unassigned: unassignedLayouts.bookLayouts.nodes,
      },
    }
  }
  return false
})

interface BookLayout {
  _id: string
  name: string
  isTemplate: boolean
  fontId: string
}

interface DataProps {
  fonts: Font[]
  font: Font
  initialBookLayout: BookLayout
  bookLayouts: {
    assigned: BookLayout[]
    template: BookLayout[]
    unassigned: BookLayout[]
  }
}

export default async function Page(props) {
  const data: DataProps | false = await getData({ slug: props.params.slug })
  const session = await auth()
  if (!session) {
    const pathname = `${process.env.NEXT_PUBIC_STOREFRONT_URL}/fonts/${props.params.slug}/book`
    const url = `${BASE_PATH}/signin?callbackUrl=${encodeURIComponent(
      pathname
    )}`
    redirect(url)
  }
  return <BookPage data={data} user={session.user} />
}
