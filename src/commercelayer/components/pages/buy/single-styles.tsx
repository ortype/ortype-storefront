import { calculateDiscount } from '@/commercelayer/utils/prices'
import type { CompanySize } from '@/sanity/lib/queries'
import { Button, Flex, Stack, Text } from '@chakra-ui/react'
import { SkuOption, type Order } from '@commercelayer/sdk'
import React, { useMemo, useState } from 'react'

interface Props {
  order: Order
  name: string
  siblingCount: number
  skuCode: string
  parentUid: string
  parentName: string
  defaultVariantId: string
  className?: string
  unitPrice: number
  nextUnitPrice: number
  addLineItem: (params: { skuCode: string }) => Promise<void>
  deleteLineItem: (params: { lineItemId: string }) => Promise<void>
}

export const SingleStyles: React.FC<Props> = ({
  order,
  name,
  skuCode,
  siblingCount,
  parentUid,
  parentName,
  defaultVariantId,
  addLineItem,
  deleteLineItem,
  unitPrice,
  nextUnitPrice,
  className,
}) => {
  // https://github.com/commercelayer/commercelayer-sdk/blob/main/src/resources/line_items.ts
  const isLineItem = order?.line_items?.find(
    ({ sku_code }) => sku_code === skuCode
  )

  const percentageDiscount = siblingCount
    ? calculateDiscount(siblingCount + 1)
    : 0

  const [isLoading, setIsLoading] = useState(false)

  // @TODO: implement optimistic UI solution
  const handleClick = async () => {
    setIsLoading(true)
    if (isLineItem) {
      // If the line item already exists in the cart, remove it
      // https://docs.commercelayer.io/core/v/api-reference/line_items/delete (by ID)
      await deleteLineItem({ lineItemId: isLineItem.id })
    } else {
      try {
        await addLineItem({
          name,
          skuCode,
          parentUid,
          parentName,
          defaultVariantId,
          price: unitPrice,
          className,
        })
        setIsLoading(false)
      } catch (e) {
        console.log('addToCart error: ', e)
      }
    }
    setIsLoading(false)
  }

  return (
    <Flex
      justifyContent={'space-between'}
      bg={isLineItem ? 'blackAlpha.300' : 'brand.50'}
      borderRadius={isLineItem ? 'full' : '0px'}
      cursor={'pointer'}
      _hover={{
        borderRadius: '100px',
        bg: 'blackAlpha.300',
        '& .toggle-button': {
          borderWidth: '4px',
        },
      }}
      onClick={handleClick}
      transition={
        'border-radius 200ms ease-in-out, background 300ms ease-in-out'
      }
      py={2}
      px={3}
    >
      <Stack direction={'row'} gap={2} alignItems={'center'}>
        <Button
          className={'toggle-button'}
          variant={'circle'}
          w={6}
          borderWidth={'2px'}
          h={6}
          minW={6}
          p={0}
          bg={isLineItem ? 'black' : 'white'}
          disabled={isLoading}
          transition={'border-width 200ms ease-in-out'}
        />
        <Text fontSize={'2xl'} lineHeight={1} as={'span'} className={className}>
          {name}
        </Text>
      </Stack>
      <Flex gap={2} alignItems={'center'}>
        {!isLineItem && percentageDiscount > 0 && unitPrice !== null && (
          <Text
            className={'discount'}
            as={'span'}
            fontSize={'xs'}
            opacity={0.6}
            textDecorationLine={'line-through'}
          >
            {`${unitPrice} EUR`}
          </Text>
        )}
        {isLineItem ? (
          <Text as={'span'} fontSize={'xs'} opacity={0.6}>
            {`ADDED`}
            {` (${isLineItem?.total_amount_float} EUR)`}
          </Text>
        ) : (
          <Text as={'span'} fontSize={'xs'}>
            {`${nextUnitPrice} EUR`}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
