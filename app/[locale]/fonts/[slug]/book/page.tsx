import { GET_BOOK_LAYOUTS } from 'graphql/queries'
import { createApolloClient } from 'hooks/useApollo'
import {
  getAllFonts,
  getAllFontsSlugs,
  getFontAndMoreFonts,
} from 'lib/sanity.client'
import { Font } from 'lib/sanity.queries'
import { cache } from 'react'
import BookPage from './BookPage'

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllFontsSlugs()
  return slugs?.map(({ slug }) => `/fonts/${slug}/book`) || []
}

const getData = cache(async ({ slug }) => {
  const [fonts = [], { font }] = await Promise.all([
    getAllFonts(),
    getFontAndMoreFonts(slug),
  ])

  const client = createApolloClient()
  // @TODO: since this is just the initial layout option, we could request all layouts and
  // match the first fontId, or fallback to a template, or unassigned (but with one query)
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
  const data: DataProps = await getData({ slug: props.params.slug })
  return <BookPage {...data} />
}
