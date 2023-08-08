import CommerceLayer, {
    CommerceLayerClient,
    Order
} from '@commercelayer/sdk'
import { getOrderDetails } from 'utils/getOrderDetails'

/*

- pass uid of Order to download endpoint
- collect font variants from order

  - based on `order.lineItems[].item.code` we can access the Sanity Variant doc, 
  and filter the metafields by platform based on what is in the `lineItems[].line_item_options[]` 
  with `name/reference`, and zip those up for delivery.

  - write query to get font variant by id in `lib/sanity.client.ts` called something like `findFontVariantById`

- generate download package (with expiry?)
- encode zip file as a base64 string to send to the browser

*/

/*
  const client = CommerceLayer({
    organization: "or-type-mvp",
    accessToken,
    domain: process.env.CL_DOMAIN
  })

  // check order id format, to avoid calling api with a wrong id in url
  // we can still try to get organization info to display proper branding
  if (!isValidOrderIdFormat(orderId)) {
    console.log('Invalid: Order Id format')
    // return invalidateCart()
  }

  const orderResource = await getOrder(client, orderId)
  // validating order
  const order = orderResource?.object
  if (!orderResource?.success || !order?.id) {
    console.log('Invalid: order')
    // return invalidateCart(true) @TODO: handle this after initial steps
  }
*/