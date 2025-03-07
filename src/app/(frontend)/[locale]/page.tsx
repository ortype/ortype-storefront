import Link from 'next/link'

import { HomePage } from '@/components/pages/home/HomePage'
import { studioUrl } from '@/sanity/env'
import { sanityFetch } from '@/sanity/lib/live'
import { homePageQuery } from '@/sanity/lib/queries'
import addShortNameToVariants from '@/sanity/utils/add-short-name'

export default async function IndexRoute() {
  const { data } = await sanityFetch({ query: homePageQuery })

  if (!data?.fonts) {
    return (
      <div className="text-center">
        You don&rsquo;t have a fonts yet,{' '}
        <Link href={`${studioUrl}/structure/font`} className="underline">
          create one now
        </Link>
        !
      </div>
    )
  }

  const fonts = addShortNameToVariants(data.fonts)

  return <HomePage data={{ fonts }} />
}
