// "use client";
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import React from 'react'

export const ApolloClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
    cache: new InMemoryCache(),
  })
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
