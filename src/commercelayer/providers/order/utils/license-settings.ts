import type { Order } from '@commercelayer/sdk'
import type { OrderStateData } from '../types'
import { skuOptionRefs } from './selection-utils'

/** The license buffer fields of the provider state, derived from an order's metadata */
export function calculateSettings(order: Order) {
  const owner = order.metadata?.license?.owner
  const hasLicenseOwnerType = typeof owner?.is_client === 'boolean'
  const isLicenseForClient = owner?.is_client === true
  return {
    // Mirror the reducer's rule: "Yourself" needs no name, "Your client"
    // requires a license owner / company name before it is considered complete.
    hasLicenseOwner:
      hasLicenseOwnerType &&
      (isLicenseForClient ? !!owner?.company?.trim() : true),
    isLicenseForClient,
    licenseOwner: owner,
    licenseSize: order.metadata?.license?.size,
    types: order.metadata?.license?.types || [],
    hasValidLicenseType:
      Array.isArray(order.metadata?.license?.types) &&
      order.metadata?.license?.types.length > 0,
  }
}

/** The license buffer as stored in `order.metadata.license` (defined fields only) */
export const licenseMetadataOf = (
  s: Pick<
    OrderStateData,
    'licenseOwner' | 'licenseSize' | 'selectedSkuOptions'
  >
) => ({
  ...(s.licenseOwner ? { owner: s.licenseOwner } : {}),
  ...(s.licenseSize ? { size: s.licenseSize } : {}),
  types: skuOptionRefs(s.selectedSkuOptions),
})

/** Stable form used to tell whether the order already has this license */
export const serializeLicense = (license: object): string =>
  JSON.stringify(license)
