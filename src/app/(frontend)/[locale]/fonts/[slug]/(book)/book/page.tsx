import { GET_BOOK_LAYOUTS } from '@/graphql/queries'
import { createApolloClient } from '@/hooks/useApollo'
import { getFontAndMoreFonts, getVisibleFonts } from '@/sanity/lib/client'
import { Font } from '@/sanity/lib/queries'
import { cache as ReactCache } from 'react'

import { auth } from '@/lib/auth'
import BookPage from './BookPage'

// export const dynamicParams = false

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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data: DataProps | false = await getData({ slug })
  const session = await auth()
  return <BookPage data={data} user={session?.user} />
}
