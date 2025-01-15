import {
  type CommerceLayerClient,
  type LineItem,
  type LineItemOptionCreate,
  type LineItemUpdate,
  type Order,
  type OrderUpdate,
  type SkuOption,
} from '@commercelayer/sdk'
import { sizes } from 'lib/settings'
import { AddLineItemLicenseTypes } from './types'

// @NOTE: move these utils to @/commmercelayer/utils in named files (??)
// like buy.ts, or addLineItemLicenseTypes.ts to not scope it by buy/cart/checkout (??)

export async function addLineItemLicenseTypes({
  cl,
  lineItem,
  selectedSkuOptions,
}: AddLineItemLicenseTypes) {
  if (selectedSkuOptions.length > 0) {
    console.log(
      'addLineItemLicenseTypes selectedSkuOptions:',
      selectedSkuOptions
    )
    const lineItemRel = await cl.line_items.relationship(lineItem.id)
    for (const skuOption of selectedSkuOptions) {
      const skuOptionRel = await cl.sku_options.relationship(skuOption.id)
      const lineItemOptionsAttributes: LineItemOptionCreate = {
        quantity: 1,
        options: [],
        sku_option: skuOptionRel,
        line_item: lineItemRel,
      }
      console.log(
        'addLineItemLicenseTypes lineItemOptionsAttributes: ',
        lineItemOptionsAttributes
      )
      await cl.line_item_options.create(lineItemOptionsAttributes)
    }
  }
}

export async function createOrUpdateOrder({
  order,
  createOrder,
  updateOrder,
  licenseSize,
}) {
  console.log('order: ', order)
  const localStorageOrderId = localStorage.getItem('order')
  let result = {
    order: {},
    success: false,
  }
  // create a new order
  if (!order?.id && !localStorageOrderId) {
    // const resultAttrs: OrderCreate = {
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.create(newOrderAttrs)

    result = await createOrder({
      persistKey: 'order',
      metadata: { license: { ...order.metadata.license, size: licenseSize } },
    })

    // @TODO: check if we need to manually add orderId to local storage
    // localStorage.setItem('order', newOrder.id)
    console.log('Created new order: ', order)
  } else {
    // const updateOrderAttrs: OrderUpdate = {
    //   id: order?.id || localStorageOrderId,
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.update(updateOrderAttrs)

    result = await updateOrder({
      id: order?.id || localStorageOrderId,
      attributes: {
        metadata: { license: { ...order.metadata.license, size: licenseSize } },
      },
      // there is an `include` param
    })

    console.log('Updated order: ', result)
  }
  return result.order.id
}
