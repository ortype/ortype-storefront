import React, { useState } from 'react'
import CommerceLayer, {
  OrderCreate,
  OrderUpdate,
  LineItem,
  SkuOptions,
  LineItemCreate,
  LineItemOptionCreate,
  type Order,
} from '@commercelayer/sdk'
import { Button } from '@chakra-ui/react'

interface Props {
  skuCode: string
  quantity?: number
  disabled: boolean
  accessToken: string
  licenseSize: string
  skuOptions: SkuOptions
  selectedSkuOptions: SkuOptions
  order: Order
  reloadOrder: () => Promise<Order | undefined>
}

const AddLineItemButton: React.FC<Props> = ({
  accessToken,
  cl,
  disabled,
  skuOptions,
  licenseSize,
  selectedSkuOptions,
  order,
  reloadOrder,
  skuCode,
  quantity,
}) => {
  const [isLoading, setIsLoading] = useState(false)

  /*
  let cl
  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }
*/
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
          const newOrderAttrs: OrderCreate = {
            metadata: { license: { size: licenseSize } },
          }
          newOrder = await cl.orders.create(newOrderAttrs)
          // @TODO: check if we need to manually add orderId to local storage
          localStorage.setItem('order', newOrder.id)
          console.log('Created new order: ', newOrderAttrs, newOrder.id, order)
        } else {
          const updateOrderAttrs: OrderUpdate = {
            id: order?.id || localStorageOrderId,
            metadata: { license: { size: licenseSize } },
          }
          const updatedOrder = await cl.orders.update(updateOrderAttrs)
          console.log(
            'Updated order: ',
            updateOrderAttrs,
            updatedOrder.id,
            updatedOrder
          )
        }

        const attrs: LineItemCreate = {
          order: order || newOrder,
          sku_code: skuCode,
          quantity: 1,
          _external_price: true,
          // _update_quantity: false, // this is an interesting param for adding multiple items instead of increasing the quantity
          // bundle_code: bundleCode,
          metadata: {
            license: {
              size: licenseSize,
              types: selectedSkuOptions.map((option) => option.reference),
            },
          },
        }

        const createdLineItem = await cl.line_items.create(attrs)
        console.log('createdLineItem: ', createdLineItem)

        for (const skuOption of selectedSkuOptions) {
          const optionAttrs: LineItemOptionCreate = {
            quantity: 1,
            line_item: createdLineItem,
            sku_option: skuOption,
          }
          const createdLineItemOption = await cl.line_item_options.create(
            optionAttrs
          )
          console.log('createdLineItemOption: ', createdLineItemOption)
        }

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
