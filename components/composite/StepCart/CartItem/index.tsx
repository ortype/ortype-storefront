import { Box, Button, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useOrderContainer } from '@commercelayer/react-components'
import CommerceLayer, {
  LineItemUpdate,
  type LineItem,
  type SkuOption,
} from '@commercelayer/sdk'
import { CheckoutContext } from 'components/data/CheckoutProvider'
import { Size, sizes, Type, types } from 'lib/settings'
import React, { useContext, useEffect, useState } from 'react'
import Select from 'react-select'

interface Props {
  types: Type[]
  sizes: Size[]
}

interface CartItemProps {
  lineItem: LineItem
}

export const CartItem: React.FC<CartItemProps> = ({ lineItem }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const { skuOptions, licenseSize, setLicenseTypes } = checkoutCtx

  const typeOptions = skuOptions
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

  // const initialTypeOption = typeOptions.find((option) => option.value === lineItem.line_item_options.)

  const initialSelectedSkuOptions = lineItem.line_item_options?.map(
    ({ sku_option }) => sku_option
  )
  const [selectedTypes, setSelectedTypes] = useState<Type[]>(
    initialLineItemOptions
  )
  const [selectedSkuOptions, setSelectedSkuOptions] = useState<SkuOption[]>(
    initialSelectedSkuOptions
  )

  const handleTypeChange = (selectedOptions: any) => {
    const selectedSkuOptions = selectedOptions.map((option: any) =>
      skuOptions.find((type) => type.reference === option.value)
    )
    setSelectedSkuOptions(selectedSkuOptions)
    setSelectedTypes(selectedOptions)
    setLicenseTypes({ lineItem, selectedSkuOptions })

    // @TODO: loading indicator?
  }

  // @TODO: prevent all the select from removing the last option or completely clearing the selected options
  // @TODO: `remove` button

  return (
    <>
      <SimpleGrid columns={2} spacing={4}>
        <Stack direction={'row'} spacing={2}>
          <Text>{lineItem.name}</Text>
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <Select
            placeholder={'Select a type'}
            options={typeOptions}
            isMulti
            value={selectedTypes}
            onChange={handleTypeChange}
          />
          <Flex>
            {selectedSkuOptions?.length > 0 && licenseSize && (
              <Text>
                <b>
                  {' '}
                  {(selectedSkuOptions.reduce(
                    (total, { price_amount_cents }) =>
                      total + Number(price_amount_cents),
                    0
                  ) *
                    licenseSize.modifier) /
                    100}{' '}
                  EUR
                </b>
              </Text>
            )}
          </Flex>
        </Stack>
      </SimpleGrid>
    </>
  )
}
