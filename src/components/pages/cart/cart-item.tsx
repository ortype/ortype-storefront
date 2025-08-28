import { useOrderContext } from '@/commercelayer/providers/Order'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/license-type-select'
import { Size, sizes, Type, types } from '@/lib/settings'
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
import React, { useContext, useEffect, useMemo, useState } from 'react'

interface Props {
  types: Type[]
  sizes: Size[]
}

interface CartItemProps {
  lineItem: LineItem
}

export const CartItem: React.FC<CartItemProps> = ({ lineItem }) => {
  const { skuOptions, licenseSize, setLicenseTypes, deleteLineItem } =
    useOrderContext()

  const formattedTypeOptions = skuOptions
    .sort(
      (a, b) =>
        parseInt(a.reference.charAt(0)) - parseInt(b.reference.charAt(0))
    )
    ?.map(
      ({ reference: value, name: label, price_amount_cents: basePrice }) => ({
        value,
        label,
        basePrice,
      })
    )

  const initialLineItemOptions = lineItem.line_item_options?.map(
    ({ sku_option }) => {
      const {
        reference: value,
        name: label,
        price_amount_cents: basePrice,
      } = sku_option
      return {
        value,
        label,
        basePrice,
      }
    }
  )

  // const initialTypeOption = formattedTypeOptions.find((option) => option.value === lineItem.line_item_options.)

  const initialSelectedSkuOptions = lineItem.line_item_options?.map(
    ({ sku_option }) => sku_option
  )
  const [selectedTypeOptionValues, setSelectedTypeOptionValues] = useState<
    Type[]
  >(initialLineItemOptions)
  const [selectedSkuOptions, setSelectedSkuOptions] = useState<SkuOption[]>(
    initialSelectedSkuOptions
  )

  const handleTypeChange = (e: { value: string[] }) => {
    const values = e.value

    // Find the corresponding options for the selected values
    const selectedOptions = values
      .map((value) =>
        formattedTypeOptions.find((option) => option.value === value)
      )
      .filter(Boolean) as Type[]

    // Find selected SkuOptions
    const selectedSkuOptionsList = values
      .map((value) => skuOptions.find((type) => type.reference === value))
      .filter(Boolean) as SkuOption[]

    setSelectedTypeOptionValues(selectedOptions) // Update Select
    setSelectedSkuOptions(selectedSkuOptionsList) // Update price calculation
    setLicenseTypes({ lineItem, selectedSkuOptions: selectedSkuOptionsList }) // Call API and update Provider state

    // @TODO: loading indicator?
  }

  // Create a list collection for the type options
  const typeOptionsCollection = useMemo(
    () => createListCollection({ items: formattedTypeOptions }),
    [formattedTypeOptions]
  )

  // @TODO: prevent all the select from removing the last option or completely clearing the selected options

  const handleRemove = () => {
    if (deleteLineItem && lineItem.id) {
      deleteLineItem({ lineItemId: lineItem.id })
    }
  }

  return (
    <>
      <SimpleGrid columns={2} gap={3} bg={'brand.50'} p={3}>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'} as={'span'} className={lineItem.sku_code}>
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
              value={selectedTypeOptionValues.map((type) => type.value)}
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
                EUR{' '}
                {(selectedSkuOptions.reduce(
                  (total, { price_amount_cents }) =>
                    total + Number(price_amount_cents),
                  0
                ) *
                  licenseSize.modifier) /
                  100}{' '}
              </Text>
            )}
          </Box>
        </Flex>
      </SimpleGrid>
    </>
  )
}
