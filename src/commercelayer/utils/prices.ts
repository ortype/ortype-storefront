import {
  type CommerceLayerClient,
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'

import type { Batch, Task } from '@commercelayer/sdk-utils'
import { executeBatch } from '@commercelayer/sdk-utils'
import { forceOrderAutorefresh } from './forceOrderAutorefresh'

// Continuous exponential discount curve constants
const START_DISCOUNT = 0.35 // 35% discount starting at 2 styles
const MAX_DISCOUNT = 0.87 // asymptotic cap at 87%
const K = 0.01 // growth rate
const P = 1.25 // curvature exponent

/**
 * Return the discount rate (0–1) for a given number of styles.
 * 1 style = no discount. 2+ styles follow a continuous exponential curve
 * that starts at START_DISCOUNT and asymptotically approaches MAX_DISCOUNT.
 *
 * @param n  total number of styles in the parentUid group
 */
export function calculateDiscount(n: number): number {
  if (n <= 1) return 0
  return Math.min(
    MAX_DISCOUNT,
    MAX_DISCOUNT -
      (MAX_DISCOUNT - START_DISCOUNT) * Math.exp(-K * Math.pow(n - 2, P))
  )
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
  // @NOTE: if we use a percentage tier based discount system similar to calculateLineItemPrice
  // we would add another `calculateMediaDiscount` helper which accepts the `mediaDiscountTiers`
  return skuOptions.reduce(
    (acc, { metadata }) => acc + Number(metadata?.price_amount_cents ?? 0),
    0
  )
}

/**
 * Compute the unit price in cents for a line item given its SKU options,
 * company size modifier, and the total number of styles in the group.
 *
 * This is the single source of truth for price calculation, used by both
 * the external price API route and the frontend for optimistic display.
 */
export function calculateLineItemPrice({
  skuOptions,
  sizeModifier,
  count,
}: {
  skuOptions: SkuOption[]
  sizeModifier: number
  count: number
}): number {
  const skuOptionsTotal = calculateSkuOptionsTotal(skuOptions)
  const basePer = skuOptionsTotal * sizeModifier
  if (count <= 1) return basePer

  const discount = calculateDiscount(count)
  const unit = basePer * (1 - discount)
  return Math.floor(unit / 100) * 100 // Math.floor(2549 / 100) * 100 → 2500 cents
}

/**
 * Convert cents to a display-friendly float (e.g. 15000 → 150).
 */
export function formatPrice(cents: number): number {
  return Math.floor(cents / 100)
}

/**
 * Get the 0-based count of a line item's siblings in a parentUid group,
 * Count 0 = first added (no discount).
 */
export function getLineItemSibilingCount(
  lineItem: LineItem,
  allLineItems: LineItem[]
): number {
  const parentUid = getParentUid(lineItem)
  if (!parentUid) return 0

  const siblings = allLineItems.filter(
    (li) =>
      (li.item_type === 'skus' || li.item_type === 'bundles') &&
      getParentUid(li) === parentUid
  )

  return siblings.length
}

/**
 * Get the 0-based position of a line item within its parentUid sibling group,
 * sorted by created_at ascending. Position 0 = first added (no discount).
 * DEPRECATED
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

  // 1. Disable auto-refresh (prevents 140 recalculations)
  await cl.orders.update({ id: order.id, autorefresh: false })

  // 2. Build batch tasks
  const tasks: Task[] = siblings.map((sibling) => ({
    resourceType: 'line_items',
    operation: 'update',
    resource: {
      id: sibling.id,
      quantity: 1,
      _external_price: true,
    },
    onFailure: {
      errorHandler: (err) => {
        console.error(`Failed to update ${sibling.sku_code}:`, err)
      },
    },
  }))

  // 3. Execute with automatic rate limiting
  await executeBatch({ tasks })

  // 4. Single refresh to recalculate everything once
  await forceOrderAutorefresh({ client: cl, order })
}
