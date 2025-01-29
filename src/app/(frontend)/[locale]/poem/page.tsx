'use client'
import { useQuery } from '@apollo/client'
import { GET_POEM_ENTRIES } from '@/graphql/queries'

interface PageProps {}

export default function Poem(props: PageProps) {
  // const { } = props
  const { data, loading, error } = useQuery(GET_POEM_ENTRIES, {
    variables: {
      first: 50,
      // offset: 50000, // @TODO: this connection arg isn't being handled by the api
      isLatinBasic: true,
      isDup: false,
      // fontIds: ['font-BBAEuUdIabmmmyulVRZIp'],
    },
  })
  if (loading) return <p>Loading ...</p>
  // console.log('GET_POEM_ENTRIES data: ', data?.poems.edges)
  // @TODO: Why does Apollo Client return dup entries with the same _id, whereas the Explorer works just fine
  return (
    <>
      {data?.poems?.edges.map((edge) => (
        <span key={edge.node._id}>
          {`${edge.node.entry} / ${edge.node.title} / ${edge.node._id}`}
          <br />
        </span>
      ))}
    </>
  )
}
