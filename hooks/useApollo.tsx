import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import cookie from 'cookie'
import merge from 'deepmerge'
import { createClient } from 'graphql-ws'
import type { IncomingMessage } from 'http'
import isEqual from 'lodash.isequal'
import type { GetServerSidePropsContext } from 'next'
import { useMemo } from 'react'

interface PageProps {
  props?: Record<string, any>
}

export const APOLLO_STATE_PROPERTY_NAME = '__APOLLO_STATE__'
export const COOKIES_TOKEN_NAME = 'jwt'

const getToken = (req?: IncomingMessage) => {
  const parsedCookie = cookie.parse(
    req ? req.headers.cookie ?? '' : document.cookie
  )

  return parsedCookie[COOKIES_TOKEN_NAME]
}

let apolloClient: ApolloClient<NormalizedCacheObject> = null

const createApolloClient = (ctx?: GetServerSidePropsContext) => {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URI
  const wsGraphqlUrl = graphqlUrl.replace('http', 'ws')

  const httpLink = new HttpLink({
    uri: graphqlUrl,
    credentials: 'same-origin', // default
    // reaction uses a key called `fetch`
  })
  let link = httpLink

  if (process.browser) {
    // If we are in the browser, try to split the request between wsLink and httpLink.
    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsGraphqlUrl,
        connectionParams: {
          // authToken: token
        },
      })
    )

    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        )
      },
      wsLink,
      httpLink
    )
  }

  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from cookies
    const token = getToken(ctx?.req)

    console.log('authLink: ', token, ctx?.req?.headers)

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    // link: authLink.concat(httpLink),
    link: ApolloLink.from([authLink, link]),
    // reaction includes `omitTypenameLink` in this list
    cache: new InMemoryCache(),
    connectToDevTools: true,
  })
}

export function initializeApollo(initialState = null, ctx = null) {
  const client = apolloClient ?? createApolloClient(ctx)

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = client.extract()

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })

    // Restore the cache with the merged data
    client.cache.restore(data)
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') {
    return client
  }

  // Create the Apollo Client once in the client
  if (!apolloClient) {
    apolloClient = client
  }

  return client
}

// @TODO: `addApolloState` is called an ssr page via getServerSideProps
// in next-advanced-apollo-starter
export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: PageProps
) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROPERTY_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(initialState) {
  // export function useApollo(pageProps: PageProps) {
  // const state = pageProps[APOLLO_STATE_PROPERTY_NAME];
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
