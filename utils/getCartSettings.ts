import CommerceLayer, {
  CommerceLayerClient,
  CommerceLayerStatic,
  Order,
} from '@commercelayer/sdk'
import { CartSettings, InvalidCartSettings } from 'CustomApp'

// import { forceOrderAutorefresh } from "./forceOrderAutorefresh"
// import { getInfoFromJwt } from "./getInfoFromJwt"
import { getOrderDetails } from './getOrderDetails'
// import { isValidHost } from "./isValidHost"
import { isValidStatus } from './isValidStatus'

import { TypeAccepted } from 'components/data/CheckoutProvider/utils'
import { LINE_ITEMS_SHOPPABLE } from 'components/utils/constants'
import { isValidOrderIdFormat } from './isValidOrderIdFormat'

import { retryCall } from 'utils/retryCall'

interface FetchResource<T> {
  object: T | undefined
  success: boolean
}
// @TODO: consider using /utils/getOrderDetails.ts
async function getOrder(
  cl: CommerceLayerClient,
  orderId: string
): Promise<FetchResource<Order> | undefined> {
  return retryCall<Order>(() =>
    cl.orders.retrieve(orderId, {
      fields: {
        orders: [
          'id',
          'autorefresh',
          'status',
          'number',
          'guest',
          'language_code',
          'terms_url',
          'privacy_url',
          'line_items',
        ],
        line_items: ['item_type'],
      },
      include: ['line_items'],
    })
  )
}

/**
 * Retrieves a list of `Settings` required to show the cart page
 *
 * @param accessToken - Access Token for a sales channel API credentials to be used to authenticate all Commerce Layer API requests.
 * Read more at {@link https://docs.commercelayer.io/developers/authentication/client-credentials#sales-channel}
 *
 * @returns an union type of `Settings` or `InvalidCartSettings`
 */
export const getCartSettings = async ({
  orderId,
  accessToken,
  domain,
  slug,
}: {
  orderId: string
  accessToken: string
  domain: string
  slug: string
}): Promise<CartSettings | InvalidCartSettings> => {
  function invalidateCart(retry?: boolean): InvalidCartSettings {
    console.log('access token:')
    console.log(accessToken)
    console.log('orderId')
    console.log(orderId)
    return {
      validCart: false,
      retryOnError: !!retry,
    } as InvalidCartSettings
  }

  if (!accessToken || !orderId) {
    return invalidateCart()
  }

  const client = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  // check order id format, to avoid calling api with a wrong id in url
  // we can still try to get organization info to display proper branding
  if (!isValidOrderIdFormat(orderId)) {
    console.log('Invalid: Order Id format')
    return invalidateCart()
  }

  const orderResource = await getOrder(client, orderId)
  // validating order
  const order = orderResource?.object
  if (!orderResource?.success || !order?.id) {
    console.log('Invalid: order')
    return invalidateCart(true)
  }

  const lineItemsShoppable = order.line_items?.filter((line_item) => {
    return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
  })

  // If there are no shoppable items we redirect to the invalid page
  if ((lineItemsShoppable || []).length === 0) {
    console.log('Invalid: No shoppable line items')
    return invalidateCart()
  }

  if (!isValidStatus(order.status)) {
    console.log('Invalid: Order status')
    return invalidateCart()
  }

  if (order.status === 'placed') {
    console.log('Invalid: Order has been placed')
    return invalidateCart()
  }

  return {
    accessToken,
    orderId: order.id,
    itemsCount: (order.line_items || []).length,
    returnUrl: order.return_url,
    cartUrl: order.cart_url,
    validCart: true,
  }
}
