import type { Metadata } from 'next'
// import Head from 'next/head'
import PageComponent from '@/components/pages/page'
import { sanityFetch } from '@/sanity/lib/live'
import { PAGES_QUERY, PAGES_SLUGS_QUERY } from '@/sanity/lib/queries'
import { notFound } from 'next/navigation'
import { PAGES_QUERYResult, PAGES_SLUGS_QUERYResult } from 'sanity.types'
// import { PageInfo as PageInfoType } from 'sanity.types'

type Props = {
  params: Promise<{ page: string }>
}

export async function generateStaticParams() {
  const { data }: { data: PAGES_SLUGS_QUERYResult } = await sanityFetch({
    query: PAGES_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  // The dynamic segment is named `[page]`, so the returned key must be
  // `page` (not `slug`) for Next.js to match these against it.
  return data.map(({ slug }) => ({ page: slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { data: page }: { data: PAGES_QUERYResult } = await sanityFetch({
    query: PAGES_QUERY,
    params,
    stega: false,
  })

  return {
    title: page?.title,
    description: page?.description,
  } satisfies Metadata
}

export default async function Page(props: Props) {
  const params = await props.params
  const [{ data: page }] = await Promise.all([
    sanityFetch({ query: PAGES_QUERY, params }),
  ])

  if (!page?._id) {
    return notFound()
  }

  return <PageComponent page={page} />
}
