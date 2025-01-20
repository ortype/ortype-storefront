import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCheckout } from '@/commercelayer/utils/isValidCheckout'
import { CheckoutProvider } from '@/components/data/CheckoutProvider'
import { Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CheckoutContainer = ({ children }: Props): JSX.Element => {
  const { clientConfig } = useIdentityContext()
  const { order, isLoading } = useOrderContext()
  const { orderId, paymentReturn, redirectResult } = useParams()

  const [fetching, setFetching] = useState(true)
  const [valid, setValid] = useState(true)

  useEffect(() => {
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
