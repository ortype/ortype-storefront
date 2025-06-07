'use client'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { CheckoutButton } from '@/components/composite/Buy'
import { CartItem } from '@/components/composite/Cart/CartItem'
import { InfoTip } from '@/components/ui/toggle-tip'
import {
  Box,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import Summary from './Summary'

const Legend = ({ children }) => {
  return (
    <Box
      px={3}
      fontSize={'xs'}
      textTransform={'uppercase'}
      color={'#737373'}
      asChild
    >
      <Flex gap={1} alignItems={'center'}>
        {children}
        <InfoTip
          content={'This is additional information about this fieldset'}
        />
      </Flex>
    </Box>
  )
}

const CartComponent = ({ openMenu, setMenuOpen, openCart, setCartOpen }) => {
  const { orderId, order, itemsCount, licenseSize, setLicenseSize } =
    useOrderContext()

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid
  if (!orderId || !order) {
    return <div>{'No items in your cart'}</div>
  }

  return (
    <Container my={6}>
      <Heading
        textAlign={'center'}
        fontSize={'2rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={8}
      >
        Cart or Bag Or Basket
      </Heading>

      <Stack direction={'column'} gap={6}>
        <SimpleGrid columns={2} gap={3}>
          <LicenseOwnerInput />
          {licenseSize && (
            <LicenseSizeSelect
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          )}
        </SimpleGrid>
        <Box>
          <SimpleGrid columns={2} spacing={4} mb={1}>
            <Legend>{'Fonts'}</Legend>
            <Flex justifyContent={'space-between'}>
              <Legend>{'License Type'}</Legend>
              <Legend>{'Price'}</Legend>
            </Flex>
          </SimpleGrid>

          <Stack gap={2}>
            {
              // @TODO: this check for order being defined shouldn't be needed
              order.line_items &&
                order.line_items.map((lineItem) => (
                  <CartItem key={lineItem.id} lineItem={lineItem} />
                ))
            }
          </Stack>
        </Box>
        <Summary />
        <CheckoutButton order={order} isDisabled={false} />
      </Stack>
    </Container>
  )
}

export default CartComponent
