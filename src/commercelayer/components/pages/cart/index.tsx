'use client'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { CartItem } from '@/commercelayer/components/pages/cart/cart-item'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { useMemo, useRef } from 'react'

import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import {
  Box,
  Center,
  Container,
  Fieldset,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { StickyBottomPanel } from '../../ui/sticky-bottom-panel'
import Summary from './cart-summary'

const CartComponent = () => {
  const { isLoading, orderId, order, licenseSize, setLicenseSize } =
    useOrderContext()

  // Memoize line item filtering and font reference calculations
  const { displayLineItems } = useMemo(() => {
    if (!order?.line_items) {
      return {
        displayLineItems: [],
      }
    }

    // Filter out payment method and shipping line items - only show SKUs and bundles
    const filteredItems = order.line_items.filter(
      (lineItem) =>
        lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
    )

    return {
      displayLineItems: filteredItems,
    }
  }, [order?.line_items])

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid

  const hasInitializedRef = useRef(false)
  const isReady = !isLoading && orderId && order && order.line_items

  // Once ready, never show spinner again
  if (isReady) {
    hasInitializedRef.current = true
  }

  if (isLoading) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )
  }

  // Show error if orderId is missing
  if (!orderId) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Text fontSize={'2xl'}>{'No items in your cart 😢'}</Text>
        </Center>
      </Box>
    )
  }

  return (
    <Container my={6} maxW={'60rem'}>
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
        <SimpleGrid columns={[1, null, 2]} gap={3}>
          <LicenseOwnerInput label={'License holder'} />
          {licenseSize && (
            <LicenseSizeSelect
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          )}
        </SimpleGrid>
        <Box>
          <Fieldset.Root>
            <Box display={['none', null, 'flex']} w={'full'}>
              <SimpleGrid columns={2} gap={4} mb={1} w={'full'}>
                <FieldsetLegend>{'Fonts'}</FieldsetLegend>
                <Flex justifyContent={'space-between'}>
                  <FieldsetLegend>{'License Type'}</FieldsetLegend>
                  <FieldsetLegend>{'Price'}</FieldsetLegend>
                </Flex>
              </SimpleGrid>
            </Box>
            <Box display={['block', null, 'none']} mb={2}>
              <FieldsetLegend>{'Items'}</FieldsetLegend>
            </Box>
          </Fieldset.Root>

          <Stack gap={2}>
            {displayLineItems.map((lineItem) => (
              <CartItem key={lineItem.id} lineItem={lineItem} />
            ))}
          </Stack>
        </Box>
        <StickyBottomPanel
          maxW={'60rem'}
          showFooter={true}
          footer={(props) => (
            <CheckoutButton orderId={orderId || ''} isDisabled={false} />
          )}
        >
          {({}) => <Summary />}
        </StickyBottomPanel>
      </Stack>
    </Container>
  )
}

export default CartComponent
