import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
  getLineItemPosition,
  getLineItemSibilingCount,
} from '@/commercelayer/utils/prices'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/license-type-select'
import {
  Box,
  createListCollection,
  Flex,
  HStack,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { type LineItem, type SkuOption } from '@commercelayer/sdk'
import React, { useMemo, useState } from 'react'

interface CartItemProps {
  lineItem: LineItem
}

export const CartItem: React.FC<CartItemProps> = ({ lineItem }) => {
  const {
    order,
    skuOptions,
    mediaTypes,
    licenseSize,
    setLicenseTypes,
    deleteLineItem,
  } = useOrderContext()

  // Sort index from mediaTypes so selections follow Sanity order
  const mediaKeyOrder = useMemo(() => {
    if (!mediaTypes?.length) return null
    return new Map(mediaTypes.map((m, i) => [m._key, i]))
  }, [mediaTypes])

  const sortByReference = (options: SkuOption[]): SkuOption[] => {
    if (!mediaKeyOrder) return options

    return [...options].sort((a, b) => {
      const aValue = mediaKeyOrder.get(a?.reference) ?? Infinity
      const bValue = mediaKeyOrder.get(b?.reference) ?? Infinity
      return aValue - bValue
    })
  }

  // Single source of truth for selected license types
  const [selectedSkuOptions, setSelectedSkuOptions] = useState<SkuOption[]>(
    sortByReference(
      (lineItem.line_item_options
        ?.map(({ sku_option }) => sku_option)
        .filter(Boolean) as SkuOption[]) ?? []
    )
  )

  // Derive select-compatible formats from skuOptions
  const formattedTypeOptions = skuOptions?.map((o) => ({
    value: o.reference,
    label: o.name,
  }))

  const typeOptionsCollection = useMemo(
    () => createListCollection({ items: formattedTypeOptions }),
    [formattedTypeOptions]
  )
  console.log({ selectedSkuOptions })
  const selectedValues = selectedSkuOptions.map((o) => o.reference)

  // Optimistic price: compute locally so the UI updates immediately
  const optimisticPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0 || !order?.line_items) {
      return null
    }
    const count = getLineItemSibilingCount(lineItem, order.line_items)
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count,
      })
    )
  }, [
    selectedSkuOptions,
    licenseSize,
    order?.line_items,
    lineItem,
  ])

  // Show optimistic price immediately; falls back to server price
  const displayPrice = optimisticPrice ?? lineItem.total_amount_float

  const handleTypeChange = (e: { value: string[] }) => {
    const next = e.value
      .map((ref) => skuOptions.find((o) => o.reference === ref))
      .filter(Boolean) as SkuOption[]

    const sorted = sortByReference(next)

    setSelectedSkuOptions(sorted)
    setLicenseTypes({ lineItem, selectedSkuOptions: sorted })
  }

  // @TODO: prevent removing the last option / completely clearing

  const handleRemove = () => {
    if (deleteLineItem && lineItem.id) {
      deleteLineItem({ lineItemId: lineItem.id })
    }
  }

  // calculate discount percentage
  const count = order
    ? getLineItemSibilingCount(lineItem, order?.line_items)
    : 0
  const percentageDiscount = count ? calculateDiscount(count) : 0

  // calculate full price
  const fullPrice =
    (selectedSkuOptions.reduce(
      (total, { metadata: { price_amount_cents } }) =>
        total + Number(price_amount_cents),
      0
    ) *
      licenseSize.modifier) /
    100

  return (
    <>
      <SimpleGrid columns={[1, null, 2]} gap={3} bg={'brand.50'} p={3}>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Text
            fontSize={'2xl'}
            lineHeight={1}
            as={'span'}
            className={lineItem.sku_code}
          >
            {lineItem.name}
          </Text>
          <Text>
            <Link onClick={handleRemove} cursor={'pointer'}>
              {'(Remove)'}
            </Link>
          </Text>
        </Stack>
        <Flex direction={'row'} alignItems={'center'}>
          <Box flexGrow={1}>
            <SelectRoot
              variant={'flushed'}
              size={'sm'}
              fontSize={'md'}
              collection={typeOptionsCollection}
              value={selectedValues}
              onValueChange={handleTypeChange}
              multiple
            >
              <SelectValueText placeholder="Select a type" />
              <SelectTrigger>{'Edit license'}</SelectTrigger>
              <SelectContent portalled={false}>
                {formattedTypeOptions.map((option) => (
                  <SelectItem key={option.value} item={option}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Box>
          <VStack
            minW={28}
            gap={1}
            alignItems={'flex-end'}
            fontVariantNumeric={'tabular-nums'}
          >
            <HStack gap={4}>
              <Text
                as={'span'}
                fontSize={'sm'}
                opacity={percentageDiscount > 0 ? 1 : 0}
              >{`${Math.floor(percentageDiscount * 100)}%`}</Text>
              <Text as={'span'} fontSize={'sm'}>
                {displayPrice} {lineItem.currency_code}
              </Text>
            </HStack>
            {displayPrice !== fullPrice && (
              <Text
                as={'span'}
                textDecoration={'line-through'}
                fontSize={'sm'}
                color={'brand.400'}
              >
                {fullPrice} {lineItem.currency_code}
              </Text>
            )}
          </VStack>
        </Flex>
      </SimpleGrid>
    </>
  )
}
