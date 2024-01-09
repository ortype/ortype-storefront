'use client'

import { type QueryResponseInitial } from '@sanity/react-loader'

import { fontAndMoreFontsQuery } from 'lib/sanity.queries' // from '@/sanity/lib/queries'
import { useQuery } from '@/sanity/loader/useQuery'
import { FontPagePayload } from '@/types'

import FontPage from './FontPage'

type Props = {
  params: { slug: string }
  initial: QueryResponseInitial<FontPagePayload | null>
}

export default function FontPreview(props: Props) {
  const { params, initial } = props
  const { data, encodeDataAttribute } = useQuery<FontPagePayload | null>(
    fontAndMoreFontsQuery,
    params,
    { initial }
  )

  return <FontPage data={data!} encodeDataAttribute={encodeDataAttribute} />
}
