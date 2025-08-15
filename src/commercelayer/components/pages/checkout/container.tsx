import { CheckoutProvider } from '@/commercelayer/providers/checkout'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCheckout } from '@/commercelayer/utils/isValidCheckout'
import { Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

// @NOTE: Since the CheckoutContainer is specifically for the checkout flow, it should probably not rely on the global OrderProvider but instead get the order directly from the Commerce Layer SDK using the orderId from the URL.
// Is this valid or is the order object that is created for the buy/cart pages actually a perfect fit for the checkout?

const CheckoutContainer = ({ children }: Props): JSX.Element => {
  const { clientConfig } = useIdentityContext()
  const { order, isLoading } = useOrderContext()
  const { orderId, paymentReturn, redirectResult } = useParams()

  const [fetching, setFetching] = useState(true)
  const [valid, setValid] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      console.log('isValidCheckout running:')
      setFetching(true)
      isValidCheckout(
        orderId,
        order,
        isLoading,
        paymentReturn,
        redirectResult,
        clientConfig
      ).then(({ validCheckout }) => {
        setFetching(false)
        setValid(validCheckout)
        console.log('validCheckout: then() ', validCheckout)
      })
    }
  }, [orderId, isLoading])

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
