import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  calculateLineItemPrice,
  formatPrice,
  getLineItemPosition,
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
  Link,
  SimpleGrid,
  Stack,
  Text,
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
    discountTiers,
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
      lineItem.line_item_options?.map(({ sku_option }) => sku_option) ?? []
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

  const selectedValues = selectedSkuOptions.map((o) => o.reference)

  // Optimistic price: compute locally so the UI updates immediately
  const optimisticPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0 || !order?.line_items) {
      return null
    }
    const position = getLineItemPosition(lineItem, order.line_items)
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        position,
        discountTiers,
      })
    )
  }, [selectedSkuOptions, licenseSize, order?.line_items, lineItem, discountTiers])

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
          <Box minW={24} textAlign={'right'} fontVariantNumeric={'tabular-nums'}>
            {displayPrice} {lineItem.currency_code}
          </Box>
        </Flex>
      </SimpleGrid>
    </>
  )
}
