import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCart } from '@/commercelayer/utils/isValidCart'
import { Text } from '@chakra-ui/react'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CartContainer = ({ children }: Props): JSX.Element => {
  const { order, orderId, isLoading } = useOrderContext()
  const { validCart } = isValidCart(orderId, order)

  // if (isLoading) return <>{'Cart: Loading...'}</>

  if (!validCart) {
    // @TODO: if orderId does not exist, show an empty cart instead of an error
    return (
      <Text fontSize={'xs'} color={'red'}>
        {'0'}
      </Text>
    )
  }

  return children
}

export default CartContainer
