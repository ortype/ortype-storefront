import { useQuery } from '@apollo/client'
import { Authorizer, useAuthorizer } from '@authorizerdev/authorizer-react'
import { GET_POEM_ENTRIES } from 'graphql/queries'

interface PageProps {}

export default function Admin(props: PageProps) {
  // const { } = props
  const authorizer = useAuthorizer()
  const { user, token, loading: tokenLoading } = authorizer
  // return (loading || tokenLoading) && <div>{'loading...'}</div>
  return (
    <>
      <Authorizer />
      {user && <div>{`Email: ${user.email} Token: ${token?.id_token}`}</div>}
    </>
  )
}

// @TODO: repurpose as password reset redirect page
