'use client'

import { useApollo } from '@/hooks/useApollo'
import { ApolloProvider } from '@apollo/client'
import React from 'react'

export const ApolloClientProvider = ({
  children,
  initialApolloState,
  token = undefined,
}: {
  initialApolloState: object
  children: React.ReactNode
  token?: string
}) => {
  const apolloClient = useApollo(initialApolloState, token)
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
