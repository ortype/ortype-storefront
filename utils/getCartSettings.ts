import CommerceLayer, { Organization } from '@commercelayer/sdk'
import { CartSettings, InvalidCartSettings } from 'CustomApp'

// import { forceOrderAutorefresh } from "./forceOrderAutorefresh"
// import { getInfoFromJwt } from "./getInfoFromJwt"
import { getOrderDetails } from './getOrderDetails'
// import { isValidHost } from "./isValidHost"
import { isValidStatus } from './isValidStatus'

import { isValidOrderIdFormat } from './isValidOrderIdFormat'

// default settings are by their nature not valid to show a full cart
// they will be used as fallback for errors or 404 page
export const defaultSettings: InvalidCartSettings = {
  isValid: false,
  retryable: false,
}

const makeInvalidCartSettings = ({
  retryable,
}: // organization,
{
  retryable?: boolean
  // organization?: Organization
}): InvalidCartSettings => ({
  ...defaultSettings,
  retryable: !!retryable,
})

/**
 * Retrieves a list of `Settings` required to show the cart page
 *
 * @param accessToken - Access Token for a sales channel API credentials to be used to authenticate all Commerce Layer API requests.
 * Read more at {@link https://docs.commercelayer.io/developers/authentication/client-credentials#sales-channel}
 *
 * @returns an union type of `Settings` or `InvalidCartSettings`
 */
export const getCartSettings = async ({
  accessToken,
  domain,
  slug,
}: {
  accessToken: string
  domain: string
  slug: string
}): Promise<CartSettings | InvalidCartSettings> => {
  /*
  const domain = config.domain || "commercelayer.io"
  const { slug, isTest } = getInfoFromJwt(accessToken)

  if (!slug) {
    return makeInvalidCartSettings({})
  }

  // checking cart consistency
  const hostname = typeof window && window.location.hostname
  if (
    !isValidHost({
      hostname,
      accessToken,
      selfHostedSlug: config.selfHostedSlug,
    })
  ) {
    return makeInvalidCartSettings({})
  }
  */

  const client = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  const orderId = localStorage.getItem('order')

  // check order id format, to avoid calling api with a wrong id in url
  // we can still try to get organization info to display proper branding
  if (!isValidOrderIdFormat(orderId)) {
    return makeInvalidCartSettings({})
  }

  const orderResponse = await getOrderDetails({ orderId, client })
  // validating order
  const order = orderResponse?.object
  if (!order) {
    return makeInvalidCartSettings({ retryable: !orderResponse?.bailed })
  }

  if (!isValidStatus(order.status)) {
    return makeInvalidCartSettings({})
  }

  // await forceOrderAutorefresh({ client, order })

  return {
    accessToken,
    orderId: order.id,
    order,
    lineItems: order.line_items || [],
    itemsCount: (order.line_items || []).length,
    returnUrl: order.return_url,
    cartUrl: order.cart_url,
    isValid: true,
  }
}
