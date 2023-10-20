import { useQuery } from '@apollo/client'
import { Authorizer, useAuthorizer } from '@authorizerdev/authorizer-react'
import { GET_POEM_ENTRIES } from 'graphql/queries'

interface PageProps {}

export default function Admin(props: PageProps) {
  // const { } = props
  const { user, token, loading: tokenLoading } = useAuthorizer()
  const { data, loading, error } = useQuery(GET_POEM_ENTRIES, {
    variables: {
      first: 50,
      // offset: 50000, // @TODO: this connection arg isn't being handled by the api
      isLatinBasic: true,
      isDup: false,
      // fontIds: ['font-BBAEuUdIabmmmyulVRZIp'],
    },
  })
  console.log('GET_POEM_ENTRIES: ', error, data)
  // return (loading || tokenLoading) && <div>{'loading...'}</div>
  return (
    <>
      <Authorizer />
      {user && <div>{`Email: ${user.email} Token: ${token?.id_token}`}</div>}
      {!loading &&
        data?.poems?.edges.map((edge) => (
          <span key={edge.node._id}>
            {`${edge.node.entry} / ${edge.node.title} / ${edge.node._id}`}
            <br />
          </span>
        ))}
    </>
  )
}

/*
Admin.getLayout = function getLayout(page) {
  return (
    <AuthorizerProvider
      config={{
        authorizerURL: 'https://authorizer-newww.koyeb.app/',
        redirectURL: typeof window !== 'undefined' && window.location.origin,
        clientID: 'd5814c60-03ba-4568-ac96-70eb7a8f397f', // obtain your client id from authorizer dashboard
        // extraHeaders: {}, // Optional JSON object to pass extra headers in each authorizer requests.
      }}
    >
      {page}
    </AuthorizerProvider>
  )
}
*/
