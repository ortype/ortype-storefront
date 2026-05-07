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

import { getParentUid } from '@/commercelayer/utils/prices'
import CartGroups from './cart-groups'

// Define your types
interface LineItemMetadata {
  license?: {
    size?: {
      label: string
      value: string
      modifier: number
    }
    types?: string[]
    parentUid?: string
  }
  parentUid?: string
  parentName?: string
  defaultVariantId?: string
}

export interface LineItem {
  id: string
  type: string
  sku_code: string
  name: string
  quantity: number
  unit_amount_float: number
  formatted_unit_amount: string
  metadata: LineItemMetadata
}

export interface GroupedLineItems {
  parentUid: string
  parentName: string
  defaultVariantId: string
  items: LineItem[]
}

// Your helper function
const getParentName = (item: LineItem): string | undefined => {
  return item.metadata.parentName
}

const getDefaultVariantId = (item: LineItem): string | undefined => {
  return item.metadata.defaultVariantId
}

const CartComponent = () => {
  const { isLoading, orderId, order, licenseSize, setLicenseSize } =
    useOrderContext()

  // The useMemo hook
  const groupedLineItems = useMemo<GroupedLineItems[]>(() => {
    if (!order?.line_items) {
      return []
    }
    const grouped = order.line_items.reduce<GroupedLineItems[]>((acc, item) => {
      const parentUid = getParentUid(item)
      const parentName = getParentName(item)
      const defaultVariantId = getDefaultVariantId(item)

      if (!parentUid) {
        return acc
      }

      const existing = acc.find((group) => group.parentUid === parentUid)

      if (existing) {
        existing.items.push(item)
      } else {
        acc.push({ parentUid, parentName, defaultVariantId, items: [item] })
      }

      return acc
    }, [])

    return grouped
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
          <CartGroups groupedLineItems={groupedLineItems} />
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
