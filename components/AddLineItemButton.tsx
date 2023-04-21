import React, { useState } from 'react'
import CommerceLayer, {
  Order,
  LineItem,
  LineItemCreate,
} from '@commercelayer/sdk'

interface Props {
  orderId?: string
  skuCode: string
  quantity?: number
  accessToken: string
}

// how do I get the "current" orderId?

const AddLineItemButton: React.FC<Props> = ({
  accessToken,
  orderId,
  skuCode,
  name,
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

  const handleClick = async () => {
    setIsLoading(true)

    try {
      // https://docs.commercelayer.io/core/external-resources/external-prices#fetching-external-prices
      // https://docs.commercelayer.io/core/v/api-reference/line_items/create
      const localStorageOrderId = localStorage.getItem('order')
      const order = await cl.orders.retrieve(orderId || localStorageOrderId)
      // @TODO: create order if none exists
      // @TODO: add metadata with current configuration options to the order
      console.log('order: ', localStorageOrderId, order)
      // if (localStorageOrderId !== null)
      // localStorage has an id looking thing `NDerhpLrje` under the key `order`
      // add to cart component must create an order if one is not in local storage
      /*      
      const lineItem: LineItem = {
        type: 'line_item',
        sku, // should this be `sku_code`?
        quantity: 1, // required
        _external_price: true,
      }*/
      const attrs: LineItemCreate = {
        order,
        sku_code: skuCode,
        quantity: 1,
        _external_price: true,
        _update_quantity: false, // this is an interesting param, maybe for adding multiple items instead of increasing the quantity
        // bundle_code: bundleCode,
        // metadata
      }

      // POST https://or-type-mvp.commercelayer.io/api/line_items 422
      const result = await cl.line_items.create(attrs)
      console.log('result: ', result)
      // does the lineItems.create with orderId take care of the "relationship", I guess, but need to check
    } catch (error) {
      console.error(error)
    }

    setIsLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Adding...' : 'Add to cart'}
    </button>
  )
}

export default AddLineItemButton
