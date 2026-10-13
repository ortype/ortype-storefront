import type { Order } from '@commercelayer/sdk'
import type { LicenseOwnerInput, LicenseSize, OrderStateData } from '../types'
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

/**
 * The license buffer as stored in `order.metadata.license` (defined fields
 * only). Writes merge this over the order's existing license metadata, so an
 * absent key leaves what is already on the order untouched.
 */
export const licenseMetadata = (parts: {
  owner?: LicenseOwnerInput
  size?: LicenseSize
  types: string[]
}) => ({
  ...(parts.owner ? { owner: parts.owner } : {}),
  ...(parts.size ? { size: parts.size } : {}),
  // An empty buffer is never written: `selectedSkuOptions` starts out empty
  // and is only rehydrated asynchronously (`fetchSkuOptions`), so writing it
  // would wipe the order's default types. These are a seed for the next font
  // anyway — the authoritative per-style types live on the line items.
  ...(parts.types.length > 0 ? { types: parts.types } : {}),
})

/** `licenseMetadata` for the provider's current license buffer */
export const licenseMetadataOf = (
  s: Pick<
    OrderStateData,
    'licenseOwner' | 'licenseSize' | 'selectedSkuOptions'
  >
) =>
  licenseMetadata({
    owner: s.licenseOwner,
    size: s.licenseSize,
    types: skuOptionRefs(s.selectedSkuOptions),
  })

/** Stable form used to tell whether the order already has this license */
export const serializeLicense = (license: object): string =>
  JSON.stringify(license)
