import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import Link from 'next/link'

import { HomePage } from '@/components/pages/home/HomePage'
import { homePageQuery } from '@/lib/sanity.queries'
import { studioUrl } from 'lib/sanity.api' // from '@/sanity/lib/api'
import { sanityFetch } from '@/sanity/lib/fetch'

export default async function IndexRoute() {
  const [data] = await Promise.all([sanityFetch({ query: homePageQuery })])

  if (!data?.fonts) {
    return (
      <div className="text-center">
        You don&rsquo;t have a homepage yet,{' '}
        <Link href={`${studioUrl}/desk/home`} className="underline">
          create one now
        </Link>
        !
      </div>
    )
  }

  return <HomePage data={data} />
}
