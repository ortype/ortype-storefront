import { CheckoutProvider } from '@/commercelayer/providers/checkout'
import { fetchOrder } from '@/commercelayer/providers/checkout/utils'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { isValidCheckout } from '@/commercelayer/utils/isValidCheckout'
import { Box, Center, Spinner, Text } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  const accessToken = clientConfig.accessToken

  // Track what we've fetched for: orderId + accessToken combination
  const fetchKeyRef = useRef<string | null>(null)

  const params = useParams()

  // Extract and validate orderId (handle string[] case from dynamic routes)
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId
  const paymentReturn = Array.isArray(params.paymentReturn)
    ? params.paymentReturn[0]
    : params.paymentReturn
  const redirectResult = Array.isArray(params.redirectResult)
    ? params.redirectResult[0]
    : params.redirectResult

  // Local state for order fetching
  const [localOrder, setLocalOrder] = useState<Order | undefined>(undefined)
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  const [fetching, setFetching] = useState(true)
  const [valid, setValid] = useState(true)

  // Ref to prevent duplicate isValidCheckout calls for the same order
  const validatedOrderRef = useRef<string | null>(null)

  // Ref to prevent duplicate order fetches for the same orderId
  const fetchedOrderRef = useRef<string | null>(null)

  // Fetch order directly from Commerce Layer API based on URL parameter
  const fetchOrderById = useCallback(
    async (orderIdParam: string) => {
      // Early return if no orderId
      if (!orderIdParam) {
        setLocalLoading(false)
        setLocalError('Order ID is required')
        return
      }

      // Early return if clientConfig is not available yet
      if (!clientConfig) {
        console.log(
          '📦 [CheckoutContainer] Client config not available yet, waiting...'
        )
        return // Don't set error, just wait for clientConfig
      }

      // Validate client config before proceeding
      if (!isValidCommerceLayerConfig(clientConfig)) {
        setLocalLoading(false)
        setLocalError('Invalid Commerce Layer configuration')
        return
      }

      try {
        setLocalLoading(true)
        setLocalError(null)
        console.log('📦 [CheckoutContainer] Fetching order:', orderIdParam)

        const cl = getCommerceLayer(clientConfig)
        const fetchedOrder = await fetchOrder(cl, orderIdParam)

        if (!fetchedOrder) {
          throw new Error('Order not found')
        }

        console.log('📦 [CheckoutContainer] Order fetched successfully:', {
          id: fetchedOrder.id,
          guest: fetchedOrder.guest,
          customer_email: fetchedOrder.customer_email,
          customer_id: fetchedOrder.customer?.id,
        })
        setLocalOrder(fetchedOrder)
      } catch (error) {
        console.error('Error fetching order:', error)
        setLocalError(
          error instanceof Error ? error.message : 'Failed to fetch order'
        )
        // Reset fetch ref on error so we can retry if needed
        fetchedOrderRef.current = null
      } finally {
        setLocalLoading(false)
      }
    },
    [clientConfig]
  )

  // Fetch order when orderId OR clientConfig changes (but only once per orderId)
  // This prevents duplicate fetches when clientConfig updates but orderId remains the same
  useEffect(() => {
    const fetchKey = `${orderId}-${accessToken}`
    if (orderId && accessToken && fetchKeyRef.current !== fetchKey) {
      console.log('📦 [CheckoutContainer] Fetching order (new key):', fetchKey)
      fetchKeyRef.current = fetchKey
      fetchOrderById(orderId)
    }
  }, [orderId, accessToken, fetchOrderById])

  // Validate and refresh the order once per checkout session
  // This useEffect runs isValidCheckout which:
  // 1. Refreshes the order (recalculates prices, taxes, inventory)
  // 2. Clears existing payment methods for a clean checkout start
  // 3. Validates the order has shoppable line items
  // 4. Sets autorefresh=true for real-time updates during checkout
  useEffect(() => {
    if (
      !localLoading &&
      localOrder &&
      validatedOrderRef.current !== localOrder.id
    ) {
      console.log(
        '📦 [CheckoutContainer] isValidCheckout running with local order:',
        localOrder.id
      )
      setFetching(true)

      // Mark this order as being validated to prevent duplicate calls
      validatedOrderRef.current = localOrder.id

      isValidCheckout(
        orderId,
        localOrder,
        localLoading,
        paymentReturn,
        redirectResult,
        clientConfig
      )
        .then(({ validCheckout }) => {
          setFetching(false)
          setValid(validCheckout)
          console.log(
            '📦 [CheckoutContainer] validCheckout: then() ',
            validCheckout
          )
        })
        .catch((error) => {
          console.error('📦 [CheckoutContainer] isValidCheckout error:', error)
          setFetching(false)
          setValid(false)
          // Reset validation ref on error so we can retry if needed
          validatedOrderRef.current = null
        })
    } else if (!localLoading && localError) {
      // If there's an error loading the order, mark as invalid
      setFetching(false)
      setValid(false)
      validatedOrderRef.current = null
    }
  }, [
    orderId,
    localLoading,
    localOrder,
    localError,
    paymentReturn,
    redirectResult,
    accessToken,
  ])

  // Show loading state while fetching order
  if (localLoading || fetching) {
    return (
      <Box pos="absolute" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
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
    <CheckoutProvider
      config={clientConfig}
      orderId={orderId}
      initialOrder={localOrder}
    >
      {children}
    </CheckoutProvider>
  )
}

export default CheckoutContainer
