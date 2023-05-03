import React, { useState } from 'react'
import CommerceLayer, {
  OrderCreate,
  OrderUpdate,
  LineItem,
  LineItemCreate,
  type Order,
} from '@commercelayer/sdk'
import { useCustomContext, OrderContext } from '@commercelayer/react-components'
import { Button } from '@chakra-ui/react'

interface Props {
  skuCode: string
  quantity?: number
  disabled: boolean
  accessToken: string
  metadata: any
  reloadOrder: () => Promise<Order | undefined>
}

// @TODO: If the line item already exists in the cart, remove it
// https://docs.commercelayer.io/core/v/api-reference/line_items/delete (by ID)
// to know what has been added to the cart we should store sku_codes and line item IDs
// in the global context so we can show state and remove by ID

const AddLineItemButton: React.FC<Props> = ({
  accessToken,
  endpoint,
  disabled,
  selectedSize,
  selectedTypes,
  order,
  reloadOrder,
  skuCode,
  metadata,
  name,
  quantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  /*
  const { addToCart, orderId, getOrder, setOrderErrors } = useCustomContext({
    context: OrderContext,
    contextComponentName: 'OrderContainer',
    currentComponentName: 'AddToCartButton',
    key: 'addToCart',
  })
  console.log('AddLineItemButton orderId: ', orderId, addToCart)
  */

  // @TODO: test out `addToCart` and `orderId` from CL context (didn't work so far)

  let cl

  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // https://docs.commercelayer.io/core/external-resources/external-prices#fetching-external-prices
      // https://docs.commercelayer.io/core/v/api-reference/line_items/create

      let newOrder
      if (!order) {
        const newOrderAttrs: OrderCreate = {}
        newOrder = await cl.orders.create(newOrderAttrs)
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

    setIsLoading(false)
  }

  return (
    <Button
      disabled={disabled}
      variant={'outline'}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? 'Adding...' : 'Add line item'}
    </Button>
  )
}

export default AddLineItemButton
