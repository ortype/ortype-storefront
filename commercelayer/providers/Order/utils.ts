import {
  type LineItemOptionCreate,
  type LineItemUpdate,
  type Order,
} from '@commercelayer/sdk'
import { sizes } from 'lib/settings'
import { UpdateLineItemsLicenseSize, UpdateLineItemLicenseTypes } from './types'

export function calculateSettings(order: Order) {
  return {
    licenseSize: order.metadata?.license?.size || sizes[0],
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

export async function updateLineItemLicenseTypes({
  cl,
  lineItem,
  selectedSkuOptions,
}: UpdateLineItemLicenseTypes) {
  const updateLineItemAttrs: LineItemUpdate = {
    id: lineItem.id,
    quantity: 1,
    _external_price: true,
    metadata: {
      license: {
        ...lineItem.metadata?.license,
        types: selectedSkuOptions.map((option) => option.reference),
      },
    },
  }
  console.log('updateLineItemAttrs: ', updateLineItemAttrs)
  await cl.line_items.update(updateLineItemAttrs)

  // Line Item Options and SKU Options
  const existingSkuOptionIds = lineItem.line_item_options.map(
    ({ sku_option }) => sku_option.id
  )
  const newSkuOptionIds = selectedSkuOptions.map(({ id }) => id)
  const skuOptionsToAdd = selectedSkuOptions.filter(
    (option) => !existingSkuOptionIds.includes(option.id)
  )
  const lineItemOptionsToDelete = lineItem.line_item_options.filter(
    (option) => !newSkuOptionIds.includes(option.sku_option.id)
  )

  // lineItem.line_item_options
  // we have the options on the lineItem, we can then check if an sku_option.id is present in this array
  // which is not found in selectedSkuOptions, and delete that line_item

  // @TODO: if multiple lineItemOptions can not be created with addToCart
  // then this would need to be updated to read from the metadata of the line_item

  if (skuOptionsToAdd && skuOptionsToAdd.length > 0) {
    console.log('skuOptionsToAdd:', skuOptionsToAdd)
    const lineItemRel = await cl.line_items.relationship(lineItem.id)
    for (const skuOption of skuOptionsToAdd) {
      const skuOptionRel = await cl.sku_options.relationship(skuOption.id)
      const lineItemOptionsAttributes: LineItemOptionCreate = {
        quantity: 1,
        options: [],
        sku_option: skuOptionRel,
        line_item: lineItemRel,
      }
      console.log('lineItemOptionsAttributes: ', lineItemOptionsAttributes)
      await cl.line_item_options.create(lineItemOptionsAttributes)
    }
  }

  if (lineItemOptionsToDelete && lineItemOptionsToDelete.length > 0) {
    console.log('lineItemOptionsToDelete: ', lineItemOptionsToDelete)
    for (const lineItemOption of lineItemOptionsToDelete) {
      await cl.line_item_options.delete(lineItemOption.id)
    }
  }
}

export async function updateLineItemsLicenseSize({
  cl,
  order,
  licenseSize,
}: UpdateLineItemsLicenseSize) {
  for (const lineItem of order?.line_items) {
    console.log('retrievedOrder lineItem: ', lineItem)
    const updateLineItemsAttrs: LineItemUpdate = {
      id: lineItem.id,
      quantity: 1,
      _external_price: true,
      metadata: {
        license: {
          ...lineItem.metadata?.license,
          types: lineItem.metadata.types || ['1-licenseType-desktop'], // @TEMP
          size: licenseSize,
        },
      },
    }
    console.log('updateLineItemsAttrs: ', updateLineItemsAttrs)
    await cl.line_items.update(updateLineItemsAttrs)
  }
}
