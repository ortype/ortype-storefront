import { FontPage } from '@/components/pages/fonts/FontPage'
import { getAllFontsSlugs } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { fontQuery } from '@/sanity/lib/queries'
import { QueryParams } from 'next-sanity'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return await getAllFontsSlugs()
}

export default async function BuyChildrenSlot({
  params,
}: {
  params: Promise<QueryParams>
}) {
  const { data } = await sanityFetch({
    query: fontQuery,
    params: await params,
  })

  if (!data?.font) {
    return notFound()
  }

  return <FontPage data={data} />
}
