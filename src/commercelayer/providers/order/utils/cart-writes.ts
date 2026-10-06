import type {
  CartWriteError,
  GroupResolutions,
  OrderStateData,
} from '../types'
import {
  deriveGroupResolutionsFromOrder,
  mergeGroupResolutions,
} from './derive-selections'

/** How many line item requests run in parallel */
export const LINE_ITEM_CONCURRENCY = 5

export const toWriteError = (
  error: unknown,
  fallback: string
): CartWriteError => ({
  message: error instanceof Error ? error.message : fallback,
  originalError: error,
})

/** Run promise factories in batches of `concurrency` (never rejects) */
export async function runConcurrent<T>(
  items: (() => Promise<T>)[],
  concurrency: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(batch.map((fn) => fn()))
    results.push(...batchResults)
  }
  return results
}

/**
 * Group resolutions in effect: those registered by the buy page (and cached in
 * localStorage), backed up by the groups already present on the order, so a
 * fresh device keeps full groups intact when it recommits a font.
 */
export const effectiveGroupResolutions = (
  s: Pick<OrderStateData, 'order' | 'groupResolutions'>
): GroupResolutions =>
  mergeGroupResolutions(
    deriveGroupResolutionsFromOrder(s.order),
    s.groupResolutions
  )
