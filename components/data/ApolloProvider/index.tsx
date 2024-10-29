// "use client";
import { ApolloProvider } from '@apollo/client'
import { useApollo } from 'hooks/useApollo'
import { useSession } from 'next-auth/react'
import React from 'react'

const ApolloProviderWrapper = ({
  token,
  children,
  initialApolloState,
}: {
  token: string
  initialApolloState: object
  children: React.ReactNode
}) => {
  const apolloClient = useApollo(initialApolloState, token)
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

export const ApolloClientProvider = async ({
  children,
  initialApolloState,
}: {
  initialApolloState: object
  children: React.ReactNode
}) => {
  // @TODO: new auth logic here
  // const { token, loading } = useAuthorizer()
  const session = useSession()
  console.log('ApolloClientProvider: session: ', session)

  return (
    <ApolloProviderWrapper initialApolloState={initialApolloState} token={{}}>
      {children}
    </ApolloProviderWrapper>
  )
}
