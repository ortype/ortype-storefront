import React, { useState } from 'react'
import CommerceLayer, {
  Order,
  OrderCreate,
  OrderUpdate,
  LineItem,
  LineItemCreate,
} from '@commercelayer/sdk'
import { useCustomContext, OrderContext } from '@commercelayer/react-components'
import { Button } from '@chakra-ui/react'

interface Props {
  orderId?: string
  skuCode: string
  quantity?: number
  disabled: boolean
  accessToken: string
  selectedSize: string
  selectedTypes: array
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
  skuCode,
  name,
  quantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const { addToCart, orderId, getOrder, setOrderErrors } = useCustomContext({
    context: OrderContext,
    contextComponentName: 'OrderContainer',
    currentComponentName: 'AddToCartButton',
    key: 'addToCart',
  })

  // @TODO: test out `addToCart` and `orderId` from CL context

  console.log('AddLineItemButton orderId: ', orderId, addToCart)

  let cl

  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }

  const handleClick = async () => {
    setIsLoading(true)

    console.log('skuCode: ', skuCode)

    const res = await addToCart({
      config: {
        accessToken,
        endpoint,
      },
      sku_code: skuCode,
      quantity: 1,
      _external_price: true,
      metadata: {
        license: {
          types: selectedTypes,
          size: selectedSize,
        },
      },
    })

    console.log('res: ', res)

    /*
    try {
      // https://docs.commercelayer.io/core/external-resources/external-prices#fetching-external-prices
      // https://docs.commercelayer.io/core/v/api-reference/line_items/create
      const localStorageOrderId = localStorage.getItem('order')
      let order

      // @TODO: create draft order if none exist
      if (!localStorageOrderId) {
        const newOrderAttrs: OrderCreate = {}
        order = await cl.orders.create(newOrderAttrs)
        // @TODO: check if we need to manually add orderId to local storage
        // we don't need to update metadata for the order currently
        localStorage.setItem('order', order.id)
      } else {
        // const updateOrderAttrs: OrderUpdate = {
        //   id: localStorageOrderId,
        //   metadata: {},
        // }
        // order = await cl.orders.update(updateOrderAttrs)
        order = await cl.orders.retrieve(orderId || localStorageOrderId)
      }

      // if (localStorageOrderId !== null)
      // localStorage has an id looking thing `NDerhpLrje` under the key `order`
      // add to cart component must create an order if one is not in local storage
      const attrs: LineItemCreate = {
        order,
        sku_code: skuCode,
        quantity: 1,
        _external_price: true,
        // _update_quantity: false, // this is an interesting param for adding multiple items instead of increasing the quantity
        // bundle_code: bundleCode,
        // @TODO: add metadata (any shape) with current configuration options
        metadata: {
          license: {
            types: selectedTypes,
            size: selectedSize,
          },
        },
      }

      // POST https://or-type-mvp.commercelayer.io/api/line_items 422
      const result = await cl.line_items.create(attrs)
      console.log('result: ', result)
      // does the lineItems.create with orderId take care of the "relationship", I guess, but need to check
    } catch (error) {
      console.error(error)
    }
    */

    setIsLoading(false)
  }

  return (
    <Button
      disabled={disabled}
      variant={'outline'}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? 'Adding...' : 'Add to cart'}
    </Button>
  )
}

export default AddLineItemButton
