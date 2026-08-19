import { BuyDialog } from '@/commercelayer/components/pages/buy/buy-dialog'
import { getAllFontsSlugs } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/live'
import { buyFontsQuery } from '@/sanity/lib/queries'
import { QueryParams } from 'next-sanity'
import { notFound } from 'next/navigation'
import { BuyFontsQueryResult } from 'sanity.types'

export async function generateStaticParams() {
  return await getAllFontsSlugs()
}

export default async function CartBuySlot({
  params,
}: {
  params: Promise<QueryParams>
}) {
  const { data }: { data: BuyFontsQueryResult } = await sanityFetch({
    query: buyFontsQuery,
    params: await params,
  })

  if (!data?.font || !data?.moreFonts) {
    return notFound()
  }

  return <BuyDialog data={data} />
}
