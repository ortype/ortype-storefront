import React, { useState } from 'react'
import CommerceLayer, {
  OrderCreate,
  LineItem,
  LineItemCreate,
  type Order,
} from '@commercelayer/sdk'
import { Button } from '@chakra-ui/react'

interface Props {
  skuCode: string
  quantity?: number
  disabled: boolean
  accessToken: string
  metadata: any
  order: Order
  reloadOrder: () => Promise<Order | undefined>
}

const AddLineItemButton: React.FC<Props> = ({
  accessToken,
  disabled,
  order,
  reloadOrder,
  skuCode,
  metadata,
  quantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  let cl
  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }

  // https://github.com/commercelayer/commercelayer-sdk/blob/main/src/resources/line_items.ts

  const isLineItem = order?.line_items.find(
    ({ sku_code }) => sku_code === skuCode
  )

  const handleClick = async () => {
    setIsLoading(true)

    if (isLineItem) {
      // If the line item already exists in the cart, remove it
      // https://docs.commercelayer.io/core/v/api-reference/line_items/delete (by ID)
      // console.log('lineItem: ', isLineItem)
      try {
        await cl.line_items.delete(isLineItem.id)
        reloadOrder()
      } catch (error) {
        console.error(error)
      }
    } else {
      try {
        // https://docs.commercelayer.io/core/external-resources/external-prices#fetching-external-prices
        // https://docs.commercelayer.io/core/v/api-reference/line_items/create
        const localStorageOrderId = localStorage.getItem('order')
        let newOrder
        if (!order?.id && !localStorageOrderId) {
          const newOrderAttrs: OrderCreate = {}
          newOrder = await cl.orders.create(newOrderAttrs)
          // @TODO: check if we need to manually add orderId to local storage
          localStorage.setItem('order', newOrder.id)
          console.log('Created new order: ', newOrder.id)
        }

        const attrs: LineItemCreate = {
          order: order || newOrder,
          sku_code: skuCode,
          quantity: 1,
          _external_price: true,
          // _update_quantity: false, // this is an interesting param for adding multiple items instead of increasing the quantity
          // bundle_code: bundleCode,
          metadata,
        }

        const result = await cl.line_items.create(attrs)
        console.log('result: ', result)
        reloadOrder()
      } catch (error) {
        console.error(error)
      }
    }

    setIsLoading(false)
  }

  const isLoadingString = isLineItem ? 'Removing...' : 'Adding...'
  const label = isLineItem ? '×' : '+'

  return (
    <Button
      disabled={disabled}
      variant={'outline'}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? isLoadingString : label}
    </Button>
  )
}

export default AddLineItemButton
