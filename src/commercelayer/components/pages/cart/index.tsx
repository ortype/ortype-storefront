'use client'
import LicenseOwnerInput from '@/commercelayer/components/forms/LicenseOwnerInput'
import { LicenseSizeSelect } from '@/commercelayer/components/forms/LicenseSizeSelect'
import { CheckoutButton } from '@/commercelayer/components/ui/checkout-button'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { useRouter } from 'next/navigation'

import type {
  SelectionBuffer,
  StyleEntry,
} from '@/commercelayer/providers/Order/types'
import { useMemo, useRef } from 'react'

import { FieldsetLegend } from '@/commercelayer/components/ui/fieldset-legend'
import {
  Box,
  Button,
  Center,
  Container,
  Fieldset,
  Flex,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Summary from './cart-summary'

import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import type { SkuOption } from '@commercelayer/sdk'
import CartGroups from './cart-groups'

/** A single cart item derived from the selection buffer */
export interface CartBufferItem {
  skuCode: string
  parentUid: string
  entry: StyleEntry
}

/** A group of cart items sharing the same parentUid */
export interface CartBufferGroup {
  parentUid: string
  parentName: string
  defaultVariantId: string
  items: CartBufferItem[]
  discountedPriceTotal: number
  fullUnitPriceTotal: number
  percentageDiscount: number
}

function isSelectionBufferEmpty(buffer: SelectionBuffer): boolean {
  return Object.keys(buffer).length === 0
}

const CartComponent = () => {
  const {
    isLoading,
    orderId,
    order,
    isLicenseForClient,
    licenseSize,
    setLicenseSize,
    selections,
    skuOptions,
    cartLabels,
  } = useOrderContext()

  const router = useRouter()

  const handleClick = () => {
    router.push(`/`)
  }

  /** Resolve a style's licenseTypes refs to SkuOption objects */
  const resolveSkuOptions = (entry: StyleEntry): SkuOption[] =>
    (entry.licenseTypes ?? [])
      .map((ref) => skuOptions?.find((o) => o.reference === ref))
      .filter(Boolean) as SkuOption[]

  // Build grouped cart data from the selection buffer
  const groupedLineItems = useMemo<CartBufferGroup[]>(() => {
    const parentUids = Object.keys(selections)
    if (parentUids.length === 0) return []

    return parentUids.map((parentUid) => {
      const group = selections[parentUid]
      const skuCodes = Object.keys(group)
      const items: CartBufferItem[] = skuCodes.map((skuCode) => ({
        skuCode,
        parentUid,
        entry: group[skuCode],
      }))

      const first = group[skuCodes[0]]
      const count = items.length
      const modifier = licenseSize?.modifier ?? 0

      // Sum per-style prices using each style's own license types
      let fullTotalCents = 0
      let discountedTotalCents = 0

      for (const { entry } of items) {
        const styleOptions = resolveSkuOptions(entry)
        if (styleOptions.length === 0) continue

        fullTotalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: modifier,
          count: 1,
        })
        discountedTotalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: modifier,
          count,
        })
      }

      return {
        parentUid,
        parentName: first?.parentName ?? '',
        defaultVariantId: first?.defaultVariantId ?? '',
        items,
        fullUnitPriceTotal: formatPrice(fullTotalCents),
        percentageDiscount: count ? calculateDiscount(count) : 0,
        discountedPriceTotal: formatPrice(discountedTotalCents),
      }
    })
  }, [selections, licenseSize?.modifier, skuOptions])

  // @TODO: CartProvider with next/dynamic to load the cart and data only if we have an orderid

  const hasInitializedRef = useRef(false)
  const isReady = !isLoading && orderId && order

  // Once ready, never show spinner again
  if (isReady) {
    hasInitializedRef.current = true
  }

  if (isLoading && !hasInitializedRef.current) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )
  }

  // Show error if orderId is missing
  if (!orderId || isSelectionBufferEmpty(selections)) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <VStack gap={6}>
            <Text fontSize={'2xl'}>{'No items in your cart 😢'}</Text>

            <Button
              onClick={handleClick}
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
            >
              {'Continue shopping'}
            </Button>
          </VStack>
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
          <Fieldset.Root>
            <FieldsetLegend info={cartLabels?.licenseHolder?.info}>
              {cartLabels?.licenseHolder?.label || 'License holder'}
            </FieldsetLegend>
            <Fieldset.Content asChild>
              <Flex
                bg={'brand.50'}
                justifyContent={'center'}
                px={'3'}
                h={11}
                fontSize={{ base: 'lg', xl: 'md' }}
                mt={1}
                borderRadius={0}
              >
                {isLicenseForClient
                  ? order?.metadata?.license?.owner?.company
                  : 'Yourself'}
              </Flex>
            </Fieldset.Content>
          </Fieldset.Root>

          {licenseSize && (
            <LicenseSizeSelect
              label={cartLabels?.companySize?.label}
              info={cartLabels?.companySize?.info}
              setLicenseSize={setLicenseSize}
              licenseSize={licenseSize}
            />
          )}
        </SimpleGrid>
        <Box>
          <Fieldset.Root>
            <Box display={['none', null, 'flex']} w={'full'}>
              <SimpleGrid columns={2} gap={4} mb={1} w={'full'}>
                <FieldsetLegend info={cartLabels?.fonts?.info}>
                  {cartLabels?.fonts?.label || 'Fonts'}
                </FieldsetLegend>
                <Flex justifyContent={'space-between'}>
                  <FieldsetLegend info={cartLabels?.licenseType?.info}>
                    {cartLabels?.licenseType?.label || 'License Type'}
                  </FieldsetLegend>
                  <FieldsetLegend info={cartLabels?.price?.info}>
                    <Box pr={4}>{cartLabels?.price?.label || 'Price'}</Box>
                  </FieldsetLegend>
                </Flex>
              </SimpleGrid>
            </Box>
            <Box display={['block', null, 'none']} mb={2}>
              <FieldsetLegend>{'Items'}</FieldsetLegend>
            </Box>
          </Fieldset.Root>
          <CartGroups groupedLineItems={groupedLineItems} />
        </Box>
        <VStack maxW={'60rem'}>
          <Summary />
          <CheckoutButton orderId={orderId || ''} isDisabled={false} />
        </VStack>
      </Stack>
    </Container>
  )
}

export default CartComponent
