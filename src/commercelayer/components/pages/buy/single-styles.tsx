import {
  calculateDiscount,
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
  siblingCount: number
  skuCode: string
  parentUid: string
  className?: string
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
  siblingCount,
  parentUid,
  selectedSkuOptions,
  licenseSize,
  addLineItem,
  deleteLineItem,
  className,
}) => {
  // Optimistic price: compute locally so the UI updates immediately
  const optimisticPrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0 || !order?.line_items) {
      return formatPrice(9000)
    }
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: siblingCount,
      })
    )
  }, [selectedSkuOptions, licenseSize, order?.line_items, siblingCount])

  // https://github.com/commercelayer/commercelayer-sdk/blob/main/src/resources/line_items.ts
  const isLineItem = order?.line_items?.find(
    ({ sku_code }) => sku_code === skuCode
  )

  const percentageDiscount = siblingCount
    ? calculateDiscount(siblingCount + 1)
    : 0

  const basePrice = useMemo(() => {
    if (!licenseSize || selectedSkuOptions.length === 0) return null
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: 0,
      })
    )
  }, [selectedSkuOptions, licenseSize])

  // Show optimistic price immediately; falls back to server price
  const displayPrice = optimisticPrice ?? isLineItem?.total_amount_float

  return (
    <Flex
      justifyContent={'space-between'}
      /*
      _hover={{
        '& .discount': {
          opacity: !isLineItem && percentageDiscount > 0 ? 1 : 0,
        },
      }}*/
      bg={isLineItem ? '#FFF8D3' : '#EEE'}
      borderRadius={isLineItem ? 'full' : 'none'}
      py={2}
      px={3}
    >
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
      <Flex gap={2} alignItems={'center'}>
        {/*<Text
          className={'discount'}
          as={'span'}
          fontSize={'xs'}
          opacity={0}
        >{`${Math.floor(percentageDiscount * 100)}%`}</Text>*/}
        {!isLineItem && percentageDiscount > 0 && basePrice !== null && (
          <Text
            className={'discount'}
            as={'span'}
            fontSize={'xs'}
            opacity={0.6}
            textDecorationLine={'line-through'}
          >
            {`${basePrice} EUR`}
          </Text>
        )}
        {isLineItem ? (
          <Text as={'span'} fontSize={'xs'} opacity={0.6}>
            {`ADDED`}
            {`(${isLineItem?.total_amount_float} EUR)`}
          </Text>
        ) : (
          <Text as={'span'} fontSize={'xs'}>
            {`${displayPrice} EUR`}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
