// "use client";
import { ApolloProvider } from '@apollo/client'
import { useAuthorizer } from '@authorizerdev/authorizer-react'
import { useApollo } from 'hooks/useApollo'
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

export const ApolloClientProvider = ({
  children,
  initialApolloState,
}: {
  initialApolloState: object
  children: React.ReactNode
}) => {
  const { token, loading } = useAuthorizer()
  console.log(
    'ApolloClientProvider authorizer token.id_token: ',
    token?.id_token
  )
  if (loading) return <div>{'loading..'}</div>
  return (
    <ApolloProviderWrapper
      initialApolloState={initialApolloState}
      token={token?.id_token}
    >
      {children}
    </ApolloProviderWrapper>
  )
}
