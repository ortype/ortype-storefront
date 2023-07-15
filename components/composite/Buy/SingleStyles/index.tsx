import { Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react'
// import { useOrderContainer } from '@commercelayer/react-components'
import { SkuOption, type Order } from '@commercelayer/sdk'
import { Size } from 'lib/settings'
import React, { useState } from 'react'
import { ToggleLineItem } from '../ToggleLineItem'

interface Props {
  order: Order
  name: string
  skuCode: string
  selectedSkuOptions: SkuOption[]
  licenseSize: Size
  addLineItem: (params: { skuCode: string }) => Promise<void>
  deleteLineItem: (params: { lineItemId: string }) => Promise<void>
}

export const SingleStyles: React.FC<Props> = ({
  order,
  name,
  skuCode,
  selectedSkuOptions,
  licenseSize,
  addLineItem,
  deleteLineItem,
}) => {
  // @TODO: consume useOrderContainer to get the licenseSize from the metadata
  // const { order } = useOrderContainer()

  return (
    <SimpleGrid columns={2} spacing={4}>
      <Stack direction={'row'} spacing={2}>
        <ToggleLineItem
          order={order}
          skuCode={skuCode}
          quantity={1}
          addLineItem={addLineItem}
          deleteLineItem={deleteLineItem}
        />
        <Text>{name}</Text>
      </Stack>
      <Stack direction={'row'} spacing={2}>
        <Flex>
          {selectedSkuOptions.length > 0 && licenseSize && (
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
  )
}
