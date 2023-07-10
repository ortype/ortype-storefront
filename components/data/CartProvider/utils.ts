import { Order } from '@commercelayer/sdk'

export function calculateSettings(order: Order) {
  console.log('calculateSettings order: ', order)
  return {
    hasLicenseOwner: Boolean(order.metadata?.license?.owner),
    isLicenseForClient: order.metadata?.license?.owner?.is_client || false,
    licenseOwner: order.metadata?.license?.owner || {},
    licenseSize: order.metadata?.license?.size,
  }
}
