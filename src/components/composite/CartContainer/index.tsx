import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCart } from '@/commercelayer/utils/isValidCart'
import { Button, Text } from '@chakra-ui/react'
import { IconButton } from '@/components/ui/chakra-iconbutton'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CartContainer = ({
  children,
  openMenu,
  setMenuOpen,
}: Props): JSX.Element => {
  const { order, orderId, isLoading, itemsCount } = useOrderContext()
  const { validCart } = isValidCart(orderId, order)

  // if (isLoading) return <>{'Cart: Loading...'}</>

  if (!validCart) {
    // @TODO: if orderId does not exist, show an empty cart instead of an error
    return <Button size={'md'} variant={'circle'} bg={'white'}>{`0`}</Button>
  }

  return (
    children || (
      <IconButton
        size={'md'}
        variant={'circle'}
        onMouseEnter={() => setMenuOpen(true)}
        // onMouseLeave={handleCloseMenu}
        data-active={openMenu ? 'true' : undefined}
        transition={'none'}
        bg={'white'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
        asChild
      >{`${itemsCount}`}</IconButton>
    )
  )
}

export default CartContainer
