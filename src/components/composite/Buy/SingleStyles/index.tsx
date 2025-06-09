import { Flex, Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
// import { useOrderContainer } from '@commercelayer/react-components'
import { SkuOption, type Order } from '@commercelayer/sdk'
import { Size } from '@/lib/settings'
import React, { useState } from 'react'
import { ToggleLineItem } from '../ToggleLineItem'

interface Props {
  orderId: string
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
  orderId,
  name,
  skuCode,
  selectedSkuOptions,
  licenseSize,
  addLineItem,
  deleteLineItem,
  className,
}) => {
  return (
    <Flex justifyContent={'space-between'}>
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <ToggleLineItem
          order={order}
          skuCode={skuCode}
          quantity={1}
          name={name}
          addLineItem={addLineItem}
          deleteLineItem={deleteLineItem}
        />
        <Text fontSize={'2xl'} as={'span'} className={className}>
          {name}
        </Text>
      </Stack>
      <Flex alignItems={'center'}>
        {orderId ? (
          selectedSkuOptions.length > 0 &&
          licenseSize && (
            <Text as={'span'} fontSize={'xs'}>
              EUR{' '}
              {(selectedSkuOptions.reduce(
                (total, { price_amount_cents }) =>
                  total + Number(price_amount_cents),
                0
              ) *
                licenseSize.modifier) /
                100}{' '}
            </Text>
          )
        ) : (
          <Text as={'span'} fontSize={'xs'}>
            <b>90 EUR</b>
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
