'use client'
import PoemPage from '@/components/pages/poem'
import { GET_LATEST_POEM_ENTRIES } from '@/graphql/queries'
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
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          console.warn('No subscription data received')
          return prev
        }

        // console.log('Previous state:', prev)
        // console.log('Subscription data:', subscriptionData.data)

        const latestPoemEntries = [
          ...prev.latestPoemEntries,
          subscriptionData.data.poemUpdated,
        ]

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

  return <PoemPage latestPoemEntries={data?.latestPoemEntries} />
}
