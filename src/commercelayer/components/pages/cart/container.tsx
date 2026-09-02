import { useOrderContext } from '@/commercelayer/providers/Order'
import { IconButton } from '@/components/ui/chakra-iconbutton'
import { Button, Circle, Float, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  // settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CartContainer = ({
  children,
  openMenu,
  setMenuOpen,
}: Props): JSX.Element => {
  const { orderId, itemsCount } = useOrderContext()

  return (
    children || (
      <Button
        bg={'white'}
        color={'black'}
        size={'sm'}
        fontSize={'md'}
        px={2}
        minW={'auto'}
        borderRadius={'none'}
        border={'2px solid black'}
        _hover={{
          bg: 'black',
          color: 'white',
        }}
        position={'relative'}
        // onClick={() => setCartOpen(true)}
        asChild
      >
        <Link href={'/cart'}>
          {`Cart`}
          <Float>
            <Circle
              fontSize={'xs'}
              // size={5}
              width={
                itemsCount < 10 ? 'var(--or-sizes-5) !important' : 'auto'
              }
              px={'0.3rem'}
              height={5}
              bg={'red'}
              color={'white'}
            >
              {itemsCount}
            </Circle>
          </Float>
        </Link>
      </Button>
    )
  )
}

export default CartContainer
