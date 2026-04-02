import {
  type CommerceLayerClient,
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'

// Hardcoded fallback tiers (1–100 scale) used when Sanity data is unavailable
const DEFAULT_DISCOUNT_TIERS = [33, 44, 66, 77, 88, 88]

/**
 * Return the discount rate (0–1) for a given position in a parentUid group.
 * Position 0 = first item (no discount). Position 1+ maps into the tiers array.
 *
 * @param position  0-based index within the sibling group
 * @param discountTiers  Array of 1–100 integers from Sanity (index 0 = 2nd style, etc.)
 */
export function calculateDiscount(
  position: number,
  discountTiers: number[] = DEFAULT_DISCOUNT_TIERS
): number {
  if (position <= 0) return 0
  const tierIndex = position - 1
  const modifier =
    tierIndex < discountTiers.length
      ? discountTiers[tierIndex]
      : discountTiers[discountTiers.length - 1] // cap at last tier
  return (modifier ?? 0) / 100
}

/**
 * Extract parentUid from a line item, checking all known metadata locations.
 */
export function getParentUid(lineItem: LineItem): string {
  return (
    lineItem.metadata?.parentUid ??
    lineItem.metadata?.license?.parentUid ??
    lineItem.item?.reference_origin ??
    ''
  )
}

/**
 * Sum the base price from selected SKU options' metadata.
 * Returns value in cents.
 */
export function calculateSkuOptionsTotal(skuOptions: SkuOption[]): number {
  return skuOptions.reduce(
    (acc, { metadata }) => acc + Number(metadata?.price_amount_cents ?? 0),
    0
  )
}

/**
 * Compute the unit price in cents for a line item given its SKU options,
 * company size modifier, and position within its parentUid group.
 *
 * This is the single source of truth for price calculation, used by both
 * the external price API route and the frontend for optimistic display.
 */
export function calculateLineItemPrice({
  skuOptions,
  sizeModifier,
  position,
  discountTiers,
}: {
  skuOptions: SkuOption[]
  sizeModifier: number
  position: number
  discountTiers?: number[]
}): number {
  const skuOptionsTotal = calculateSkuOptionsTotal(skuOptions)
  const total = skuOptionsTotal * sizeModifier
  if (position <= 0) return total

  let discount = total * calculateDiscount(position, discountTiers)
  discount = Math.ceil(discount / 100) * 100
  return total - discount
}

/**
 * Convert cents to a display-friendly float (e.g. 15000 → 150).
 */
export function formatPrice(cents: number): number {
  return cents / 100
}

/**
 * Get the 0-based position of a line item within its parentUid sibling group,
 * sorted by created_at ascending. Position 0 = first added (no discount).
 */
export function getLineItemPosition(
  lineItem: LineItem,
  allLineItems: LineItem[]
): number {
  const parentUid = getParentUid(lineItem)
  if (!parentUid) return 0

  const siblings = allLineItems
    .filter(
      (li) =>
        (li.item_type === 'skus' || li.item_type === 'bundles') &&
        getParentUid(li) === parentUid
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  const index = siblings.findIndex((li) => li.sku_code === lineItem.sku_code)
  return index >= 0 ? index : siblings.length
}

/**
 * After a line item is deleted, trigger a price recalculation on remaining
 * siblings in the same parentUid group. Each update sets `_external_price: true`
 * which fires the external price callback, where the position-based discount
 * will now reflect the updated group size.
 */
export async function recalculateSiblingPrices({
  cl,
  order,
  parentUid,
}: {
  cl: CommerceLayerClient
  order: Order
  parentUid: string
}): Promise<void> {
  if (!order.line_items?.length || !parentUid) return

  const siblings = order.line_items
    .filter(
      (li) =>
        (li.item_type === 'skus' || li.item_type === 'bundles') &&
        getParentUid(li) === parentUid
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

  if (siblings.length === 0) return

  if (process.env.NODE_ENV !== 'production') {
    console.log('[recalculateSiblingPrices] Updating siblings:', {
      parentUid,
      count: siblings.length,
      skuCodes: siblings.map((s) => s.sku_code),
    })
  }

  for (const sibling of siblings) {
    await cl.line_items.update({
      id: sibling.id,
      quantity: 1,
      _external_price: true,
    })
  }
}
