import { useQuery } from '@apollo/client'
import { ApolloClientProvider } from 'components/data/ApolloProvider'
import { GET_MOVIES } from 'graphql/queries'

interface PageProps {}

export default function Poem(props: PageProps) {
  // const { } = props
  const { data, loading, error } = useQuery(GET_MOVIES)
  console.log('data: ', data)
  return <>{'hi!'}</>
}

Poem.getLayout = function getLayout(page) {
  return <ApolloClientProvider>{page}</ApolloClientProvider>
}
