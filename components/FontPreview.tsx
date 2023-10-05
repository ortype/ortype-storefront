import { useQuery } from '@apollo/client'
import { Text } from '@chakra-ui/react'
import { GET_FONT_TESTER_BY_ID, GET_LATEST_POEM_ENTRIES } from 'graphql/queries'
// import { SUB_FONT_TESTER_BY_ID } from 'graphql/subscriptions'
import type { Font } from 'lib/sanity.queries'
import Link from 'next/link'

export default function FontPreview({ _id, name, slug }: Omit<Font, '_type'>) {
  /*  
  const { data, loading, error } = useQuery(GET_LATEST_POEM_ENTRIES, {
    variables: {
      fontId: _id,
    },
  })
  */

  const { subscribeToMore, loading, data } = useQuery(GET_FONT_TESTER_BY_ID, {
    variables: { fontId: _id },
  })
  if (loading) return <p>Loading ...</p>
  console.log('GET_FONT_TESTER_BY_ID: ', _id, name, data?.fontTesterById)
  return (
    <div>
      <h3 className="mb-3 text-3xl leading-snug">
        <Link href={`/fonts/${slug}`} className="hover:underline">
          <Text fontSize="6xl">{data?.fontTesterById?.entry}</Text>
          <Text fontSize="md">{name}</Text>
        </Link>
      </h3>
    </div>
  )
}
