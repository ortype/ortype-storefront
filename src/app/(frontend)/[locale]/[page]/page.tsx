import type { Metadata } from 'next'
// import Head from 'next/head'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/live'
import { PAGES_QUERY, PAGES_SLUGS_QUERY } from '@/sanity/lib/queries'
import PageComponent from '@/components/pages/page'
// import { PageInfo as PageInfoType } from '@/sanity.types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: PAGES_SLUGS_QUERY,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { data: page } = await sanityFetch({
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
