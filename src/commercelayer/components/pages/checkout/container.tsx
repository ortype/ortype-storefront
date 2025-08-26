import { CheckoutProvider } from '@/commercelayer/providers/checkout'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { isValidCheckout } from '@/commercelayer/utils/isValidCheckout'
import { getOrder } from '@/commercelayer/utils/getOrder'
import getCommerceLayer, { isValidCommerceLayerConfig } from '@/commercelayer/utils/getCommerceLayer'
import { Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import type { Order } from '@commercelayer/sdk'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

// @NOTE: The CheckoutContainer now fetches the order directly from the Commerce Layer SDK using the orderId from the URL.
// This approach allows for:
// 1. A global cart that works independently from checkout flows
// 2. Direct access to specific checkout flows via URL (enabling order sharing, etc.)
// 3. Better separation of concerns between cart and checkout functionality
// 4. Avoiding conflicts between localStorage-based cart state and URL-based checkout orders

const CheckoutContainer = ({ children }: Props): JSX.Element => {
  const { clientConfig } = useIdentityContext()
  const params = useParams()
  
  // Extract and validate orderId (handle string[] case from dynamic routes)
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId
  const paymentReturn = Array.isArray(params.paymentReturn) ? params.paymentReturn[0] : params.paymentReturn  
  const redirectResult = Array.isArray(params.redirectResult) ? params.redirectResult[0] : params.redirectResult

  // Local state for order fetching
  const [localOrder, setLocalOrder] = useState<Order | undefined>(undefined)
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  const [fetching, setFetching] = useState(true)
  const [valid, setValid] = useState(true)

  // Fetch order directly from Commerce Layer API based on URL parameter
  const fetchOrderById = useCallback(async (orderIdParam: string) => {
    if (!orderIdParam || !clientConfig) {
      setLocalLoading(false)
      setLocalError('Missing order ID or client configuration')
      return
    }

    try {
      setLocalLoading(true)
      setLocalError(null)

      const cl = isValidCommerceLayerConfig(clientConfig) ? getCommerceLayer(clientConfig) : undefined
      
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      const orderResponse = await getOrder({ client: cl, orderId: orderIdParam })
      const fetchedOrder = orderResponse?.object

      if (!fetchedOrder) {
        throw new Error('Order not found')
      }

      setLocalOrder(fetchedOrder)
    } catch (error) {
      console.error('Error fetching order:', error)
      setLocalError(error instanceof Error ? error.message : 'Failed to fetch order')
    } finally {
      setLocalLoading(false)
    }
  }, [clientConfig])

  // Fetch order when orderId changes
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
    }
  }, [orderId, fetchOrderById])

  useEffect(() => {
    if (!localLoading && localOrder) {
      console.log('isValidCheckout running with local order:')
      setFetching(true)
      isValidCheckout(
        orderId,
        localOrder,
        localLoading,
        paymentReturn,
        redirectResult,
        clientConfig
      ).then(({ validCheckout }) => {
        setFetching(false)
        setValid(validCheckout)
        console.log('validCheckout: then() ', validCheckout)
      })
    } else if (!localLoading && localError) {
      // If there's an error loading the order, mark as invalid
      setFetching(false)
      setValid(false)
    }
  }, [orderId, localLoading, localOrder, localError, paymentReturn, redirectResult, clientConfig])

  // Show loading state while fetching order
  if (localLoading || fetching) {
    return (
      <Text fontSize={'xs'}>
        {'Loading checkout...'}
      </Text>
    )
  }

  // Show error if order fetching failed
  if (localError) {
    return (
      <Text fontSize={'xs'} color={'red'}>
        {`Failed to load checkout: ${localError}`}
      </Text>
    )
  }

  // Show error if orderId is missing
  if (!orderId) {
    return (
      <Text fontSize={'xs'} color={'red'}>
        {'Order ID is required for checkout'}
      </Text>
    )
  }

  // Show error if checkout is invalid
  if (!valid) {
    return (
      <Text fontSize={'xs'} color={'red'}>
        {'Invalid checkout'}
      </Text>
    )
  }

  return (
    <CheckoutProvider config={clientConfig} orderId={orderId}>
      {children}
    </CheckoutProvider>
  )
}

export default CheckoutContainer
