import {
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import type { CompanySize } from '@/sanity/lib/queries'
import { Box, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { SkuOption, type Order } from '@commercelayer/sdk'
import React, { useMemo } from 'react'
import { ToggleLineItem } from './toggle-line-item'

interface Props {
  orderId: string
  order: Order
  name: string
  position: number
  skuCode: string
  parentUid: string
  className?: string
  discountTiers?: number[]
  selectedSkuOptions: SkuOption[]
  licenseSize: CompanySize
  addLineItem: (params: { skuCode: string }) => Promise<void>
  deleteLineItem: (params: { lineItemId: string }) => Promise<void>
}

export const SingleStyles: React.FC<Props> = ({
  order,
  orderId,
  name,
  skuCode,
  position,
  parentUid,
  discountTiers,
  selectedSkuOptions,
  licenseSize,
  addLineItem,
  deleteLineItem,
  className,
}) => {
  // Optimistic price: compute locally so the UI updates immediately
  const optimisticPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0 || !order?.line_items) {
      return 9000
    }
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        position,
        discountTiers,
      })
    )
  }, [selectedSkuOptions, licenseSize, order?.line_items, discountTiers])

  // https://github.com/commercelayer/commercelayer-sdk/blob/main/src/resources/line_items.ts
  const isLineItem = order?.line_items?.find(
    ({ sku_code }) => sku_code === skuCode
  )

  // Show optimistic price immediately; falls back to server price
  const displayPrice = optimisticPrice ?? isLineItem?.total_amount_float

  return (
    <Flex justifyContent={'space-between'}>
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <ToggleLineItem
          order={order}
          isLineItem={isLineItem}
          skuCode={skuCode}
          parentUid={parentUid}
          price={displayPrice}
          className={className}
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
        <Text as={'span'} fontSize={'xs'} opacity={isLineItem ? 1 : 0.6}>
          {`${displayPrice} EUR`}
        </Text>
      </Flex>
    </Flex>
  )
}
