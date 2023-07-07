import CommerceLayer, {
  CommerceLayerClient,
  CommerceLayerStatic,
  Order,
  Organization,
} from '@commercelayer/sdk'
import { TypeAccepted } from 'components/data/CheckoutProvider/utils'
import { LINE_ITEMS_SHOPPABLE } from 'components/utils/constants'
import jwt_decode from 'jwt-decode'
import { retryCall } from 'utils/retryCall'

const BLACK_COLOR = '#000'
const RETRIES = 2

interface JWTProps {
  organization: {
    slug: string
    id: string
  }
  application: {
    kind: string
  }
  test: boolean
}

interface FetchResource<T> {
  object: T | undefined
  success: boolean
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

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

function getTokenInfo(accessToken: string) {
  try {
    const {
      organization: { slug },
      application: { kind },
      test,
    } = jwt_decode(accessToken) as JWTProps

    return { slug, kind, isTest: test }
  } catch (e) {
    console.log(`error decoding access token: ${e}`)
    return {}
  }
}

export const getCheckoutSettings = async ({
  // from getSettings (getCustomerSettings?)
  accessToken,
  endpoint,
  domain,
  slug,
  subdomain,
  companyName,
  language,
  primaryColor,
  logoUrl,
  faviconUrl: favicon,
  gtmId,
  supportEmail,
  supportPhone,
  // from useSettingsOrInvalid
  orderId,
  paymentReturn,
}: {
  // accessToken: string
  orderId: string
  paymentReturn?: boolean
  // subdomain: string
}) => {
  // const domain = process.env.NEXT_PUBLIC_DOMAIN || "commercelayer.io"

  function invalidateCheckout(retry?: boolean): InvalidCheckoutSettings {
    console.log('access token:')
    console.log(accessToken)
    console.log('orderId')
    console.log(orderId)
    return {
      validCheckout: false,
      retryOnError: !!retry,
    } as InvalidCheckoutSettings
  }

  if (!accessToken || !orderId) {
    return invalidateCheckout()
  }

  const kind = 'sales_channel'
  const isTest = true
  // const { slug, kind, isTest } = getTokenInfo(accessToken)
  // @TODO: I think these come from the CustomerContext

  if (!slug) {
    return invalidateCheckout()
  }

  if (isProduction() && (subdomain !== slug || kind !== 'sales_channel')) {
    return invalidateCheckout()
  } else if (kind !== 'sales_channel') {
    return invalidateCheckout()
  }

  const cl = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  /*
  const organizationResource = await getOrganization(cl)

  const organization = organizationResource?.object

  if (!organizationResource?.success || !organization?.id) {
    console.log("Invalid: organization")
    return invalidateCheckout(true)
  }
  */

  const orderResource = await getOrder(cl, orderId)
  const order = orderResource?.object

  if (!orderResource?.success || !order?.id) {
    console.log('Invalid: order')
    return invalidateCheckout(true)
  }

  const lineItemsShoppable = order.line_items?.filter((line_item) => {
    return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
  })

  // If there are no shoppable items we redirect to the invalid page
  if ((lineItemsShoppable || []).length === 0) {
    console.log('Invalid: No shoppable line items')
    return invalidateCheckout()
  }

  if (order.status === 'draft' || order.status === 'pending') {
    // If returning from payment (PayPal) skip order refresh and payment_method reset
    console.log(
      !paymentReturn ? 'refresh order' : 'return from external payment'
    )
    if (!paymentReturn) {
      const _refresh = !paymentReturn
      try {
        await cl.orders.update({
          id: order.id,
          _refresh,
          payment_method: cl.payment_methods.relationship(null),
          ...(!order.autorefresh && { autorefresh: true }),
        })
      } catch {
        console.log('error refreshing order')
      }
    }
  } else if (order.status !== 'placed') {
    return invalidateCheckout()
  }

  const checkoutSettings: CheckoutSettings = {
    accessToken,
    endpoint,
    domain,
    slug,
    // unique?
    orderNumber: order.number || 0,
    orderId: order.id,
    validCheckout: true,
    // shared...
    logoUrl,
    companyName,
    language,
    primaryColor,
    favicon,
    gtmId,
    supportEmail,
    supportPhone,
    termsUrl: order.terms_url,
    privacyUrl: order.privacy_url,
  }

  console.log('checkoutSettings: ', checkoutSettings)

  return checkoutSettings
}
