import { BookLayoutProvider } from '@/components/data/BookProvider'
import { GET_BOOK_LAYOUTS } from '@/graphql/queries'
import { createApolloClient } from '@/hooks/useApollo'
import { getFontAndMoreFonts, getVisibleFonts } from '@/sanity/lib/client'
import { Font } from '@/sanity/lib/queries'
import { cache } from 'react'

const getData = cache(async ({ slug }) => {
  const [fonts = [], { font }] = await Promise.all([
    getVisibleFonts(),
    getFontAndMoreFonts(slug),
  ])

  const client = createApolloClient()

  if (font) {
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

// This is a Server Component
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {
    slug: string
  }
}) {
  const data: DataProps | false = await getData({ slug: params.slug })

  return <BookLayoutProvider data={data}>{children}</BookLayoutProvider>
}
