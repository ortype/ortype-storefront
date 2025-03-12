'use client'
import PoemPage from '@/components/pages/poem'
import { GET_LATEST_POEM_ENTRIES, GET_POEM_ENTRIES } from '@/graphql/queries'
import { ON_POEM_UPDATED } from '@/graphql/subscriptions'
import { useQuery } from '@apollo/client'
import { useEffect } from 'react'

export default function Poem() {
  const { subscribeToMore, data, loading, error } = useQuery(
    GET_LATEST_POEM_ENTRIES,
    {
      variables: {},
    }
  )

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ON_POEM_UPDATED,
      // Pass a specific ID to attempt to listen to one item only
      // variables: { id: fontId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          console.warn('No subscription data received')
          return prev
        }

        console.log('Previous state:', prev)
        console.log('Subscription data:', subscriptionData.data)
        // .unshift(subscriptionData.data.poemUpdated)
        // @NOTE: this fires the second we focus on a Tester Input

        const latestPoemEntries = [
          subscriptionData.data.poemUpdated,
          ...prev.latestPoemEntries,
        ]
        console.log({ latestPoemEntries })

        return {
          latestPoemEntries,
        }
      },
      onError: (error) => {
        console.error('Subscription error:', error)
      },
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [subscribeToMore])

  if (loading) return <p>Loading ...</p>

  console.log('GET_LATEST_POEM_ENTRIES data: ', data)
  return <PoemPage latestPoemEntries={data?.latestPoemEntries} />
}
