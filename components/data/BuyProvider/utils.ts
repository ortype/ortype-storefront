import { sizes } from 'lib/settings'
import {
  type CommerceLayerClient,
  type LineItem,
  type LineItemOptionCreate,
  type Order,
  type OrderUpdate,
  type SkuOption,
  type LineItemUpdate,
} from '@commercelayer/sdk'

import { AppStateData, LicenseSize } from 'components/data/BuyProvider'

export async function createOrUpdateOrder({
  order,
  createOrder,
  updateOrder,
  licenseSize,
}) {
  console.log('order: ', order)
  const localStorageOrderId = localStorage.getItem('order')
  let result
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

export function calculateSettings(order: Order, state) {
  return {
    // licenseTypes: [],
    // selectedSkuOptions: state.selectedSkuOptions,
    licenseSize: order.metadata?.license?.size || sizes[0],
  }
}
