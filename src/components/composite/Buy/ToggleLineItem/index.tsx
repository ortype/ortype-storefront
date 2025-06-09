import { Button } from '@chakra-ui/react'
import { Order } from '@commercelayer/sdk'

import React, { useContext, useState } from 'react'

interface Props {
  order: Order
  skuCode: string
  name: string
  quantity?: number
  addLineItem: (params: { skuCode: string }) => Promise<void>
  deleteLineItem: (params: { lineItemId: string }) => Promise<void>
}

export const ToggleLineItem: React.FC<Props> = ({
  order,
  skuCode,
  name,
  addLineItem,
  deleteLineItem,
  quantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  // https://github.com/commercelayer/commercelayer-sdk/blob/main/src/resources/line_items.ts
  const isLineItem = order?.line_items?.find(
    ({ sku_code }) => sku_code === skuCode
  )

  const handleClick = async () => {
    setIsLoading(true)
    if (isLineItem) {
      // If the line item already exists in the cart, remove it
      // https://docs.commercelayer.io/core/v/api-reference/line_items/delete (by ID)
      await deleteLineItem({ lineItemId: isLineItem.id })
    } else {
      try {
        await addLineItem({ name, skuCode })
        setIsLoading(false)
      } catch (e) {
        console.log('addToCart error: ', e)
      }
    }
    setIsLoading(false)
  }

  const isLoadingString = isLineItem ? 'Removing...' : 'Adding...'
  const label = isLineItem ? '×' : '+'

  return (
    <Button
      variant={'circle'}
      w={6}
      borderWidth={'2px'}
      h={6}
      minW={6}
      p={0}
      bg={isLineItem ? 'black' : 'white'}
      onClick={handleClick}
      disabled={isLoading}
    />
  )
}

export default ToggleLineItem
