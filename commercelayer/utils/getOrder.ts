import type { CommerceLayerClient } from '@commercelayer/sdk'

import { retryCall } from './retryCall'

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
        'currency_code',
        'customer_email',
        'status',
        'total_amount_with_taxes_float',
        'payment_method',
        'payment_source',
        'customer',
        'metadata',
      ],
    },
    include: ['shipping_address', 'billing_address', 'line_items'],
  })
}
