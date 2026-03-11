import { useOrderContext } from '@/commercelayer/providers/Order'
import { isValidCart } from '@/commercelayer/utils/isValidCart'
import { IconButton } from '@/components/ui/chakra-iconbutton'
import { Button, Circle, Float, Text } from '@chakra-ui/react'
import Link from 'next/link'

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
    return (
      <Button
        variant={'block'}
        borderWidth={'3px'}
        fontSize={'xl'}
        px={2}
        // borderRadius={'full'}
        bg={'white'}
        _hover={{ color: 'white', bg: 'black' }}
        fontVariantNumeric={'tabular-nums'}
        // onClick={() => setCartOpen(true)}
        asChild
      >
        <Link href={'/cart'}>{`Cart`}</Link>
      </Button>
    )
    /*
    return (
      <Button
        size={'md'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
        variant={'circle'}
        bg={'white'}
        data-active={openMenu ? 'true' : undefined}
        onMouseEnter={() => setMenuOpen(true)}
      >{`0`}</Button>
    )
    */
  }

  return (
    children || (
      <Button
        variant={'block'}
        // borderRadius={'full'}
        bg={'white'}
        _hover={{ color: 'white', bg: 'black' }}
        borderWidth={'3px'}
        fontSize={'xl'}
        px={2}
        fontVariantNumeric={'tabular-nums'}
        position={'relative'}
        // onClick={() => setCartOpen(true)}
        asChild
      >
        <Link href={'/cart'}>
          {`Cart`}
          <Float>
            <Circle fontSize={'md'} size={5} bg={'blue'} color={'white'}>
              {itemsCount}
            </Circle>
          </Float>
        </Link>
      </Button>
    )
  )
}

export default CartContainer
