/**
 * @deprecated This file is used by legacy OrderProvider component.
 * Will be removed once account area is refactored.
 * For new code:
 * - Use fetchOrder from @/commercelayer/providers/checkout/utils for checkout context
 * - Use getOrder from @/commercelayer/providers/Order/utils/getOrder for cart/order display
 */

import type { CommerceLayerClient } from '@commercelayer/sdk'

import { retryCall } from '@/utils/retryCall'

interface GetOrderConfig {
  /**
   * The signed Commerce Layer SDK client
   */
  client: CommerceLayerClient
  /**
   * The id of the Order resource we want to fetch
   */
  orderId: string
}

/**
 * Retrieves the order details by its id with auto-retries in case of network or timeout errors.
 *
 * @param config - `GetOrderConfig` object containing both sdk `client` and `orderId`
 *
 * @returns an object containing the resolved `Order` and the status of async operation.
 */
export const getOrder = async (config: GetOrderConfig) => {
  const { client, orderId } = config
  return retryCall(() => getAsyncOrder(client, orderId))
}

export const getAsyncOrder = async (
  client: CommerceLayerClient,
  orderId: string
) => {
  return await client.orders.retrieve(orderId, {
    fields: {
      orders: [
        'id',
        'status',
        'placed_at',
        'number',
        'guest',
        'line_items',
        'shipping_address',
        'billing_address',
      ],
    },
    include: ['shipping_address', 'billing_address', 'line_items'],
  })
}
