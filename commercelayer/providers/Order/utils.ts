import { type Order } from '@commercelayer/sdk'
import { sizes } from 'lib/settings'

export function calculateSettings(order: Order) {
  return {
    licenseSize: order.metadata?.license?.size || sizes[0],
  }
}
