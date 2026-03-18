import { useOrderContext } from '@/commercelayer/providers/Order'
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
    return [...options].sort(
      (a, b) =>
        (mediaKeyOrder.get(a.reference) ?? Infinity) -
        (mediaKeyOrder.get(b.reference) ?? Infinity)
    )
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
          <Box minW={24} textAlign={'right'}>
            {selectedSkuOptions?.length > 0 && licenseSize && (
              <Text as={'span'} fontVariantNumeric={'tabular-nums'}>
                {(selectedSkuOptions.reduce(
                  (total, { price_amount_cents }) =>
                    total + Number(price_amount_cents),
                  0
                ) *
                  licenseSize.modifier) /
                  100}{' '}
                EUR
              </Text>
            )}
          </Box>
        </Flex>
      </SimpleGrid>
    </>
  )
}
