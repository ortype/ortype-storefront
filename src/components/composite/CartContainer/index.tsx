import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCart } from '@/commercelayer/utils/isValidCart'
import { Button, Text } from '@chakra-ui/react'

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
    return <Button size={'md'} variant={'circle'} bg={'white'}>{`0`}</Button>
  }

  return children
}

export default CartContainer
