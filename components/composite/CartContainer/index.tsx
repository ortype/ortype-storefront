import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCart } from '@/commercelayer/utils/isValidCart'
import { Text } from '@chakra-ui/react'
import { OrderContainer, OrderStorage } from '@commercelayer/react-components'
import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import Cart from 'components/composite/Cart'
import { CartProvider } from 'components/data/CartProvider'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CartContainer = ({ children }: Props): JSX.Element => {
  const { order, orderId, isLoading } = useOrderContext()
  const { validCart } = isValidCart(orderId, order)

  // if (isLoading) return <>{'Cart: Loading...'}</>

  if (!validCart) {
    return (
      <Text fontSize={'xs'} color={'red'}>
        {'Invalid cart'}
      </Text>
    )
  }

  return children
}

export default CartContainer
