import { ApolloProvider } from '@apollo/client'
import { useApollo } from 'hooks/useApollo'
import { useSession } from 'next-auth/react'
import React from 'react'

export const ApolloClientProvider = ({
  children,
  initialApolloState,
}: {
  initialApolloState: object
  children: React.ReactNode
}) => {
  const session = useSession()
  console.log('ApolloClientProvider: session: ', session)
  const token = null
  const apolloClient = useApollo(initialApolloState, token)
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
