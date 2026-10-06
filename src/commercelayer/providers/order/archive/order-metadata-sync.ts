/**
 * ARCHIVED — not imported anywhere. See `./index.ts` for context.
 *
 * The order-metadata half of the retired selections sync. After every change
 * to `selections`, `committedGroups` or the license buffer, `OrderProvider`
 * debounced (1.5s) a single `orders.update` that wrote, together:
 *
 *   metadata.license             -> { owner, size, types }
 *   metadata.cart_selections     -> JSON.stringify(SelectionBuffer)
 *   metadata.cart_committed_groups -> JSON.stringify(CommittedGroups)
 *
 * They were written in one update so they could never clobber each other.
 * `commitGroup` / `removeGroup` also called the same function explicitly with
 * the *next* selections/committedGroups so metadata matched the line items
 * they had just written.
 *
 * Known weaknesses (why it was retired):
 *  - It is a second copy of what is already on the order's line items, so it
 *    could drift (e.g. a font removed on /cart stayed in the order).
 *  - Whole-cart JSON in one metadata value is bounded by Commerce Layer's
 *    metadata size limit; large carts failed silently (errors were swallowed).
 *  - The payload spread `orderToSync.metadata` from React state, which could
 *    be stale and overwrite newer metadata.
 */
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import type { Order } from '@commercelayer/sdk'
import { useEffect, useRef } from 'react'
import type { LicenseSize, SelectionBuffer } from '../types'
import type { LegacyCommittedGroups } from './selections-local-storage'

type CommerceLayerConfig = Parameters<typeof getCommerceLayer>[0]

export type LegacyLicenseBuffer = {
  owner?: unknown
  size?: LicenseSize
  /** SkuOption references */
  types: string[]
}

/** Stable hash used to skip redundant syncs */
export function legacyMetadataSyncHash(params: {
  committedGroups: LegacyCommittedGroups
  selections: SelectionBuffer
  license: LegacyLicenseBuffer
}): string {
  return JSON.stringify(params)
}

/** Build the metadata payload that was written to the order */
export function buildLegacyMetadataPayload(params: {
  order: Order
  license: LegacyLicenseBuffer
  selections: SelectionBuffer
  committedGroups: LegacyCommittedGroups
}) {
  const { order, license, selections, committedGroups } = params
  return {
    ...order.metadata,
    license: { ...(order.metadata?.license || {}), ...license },
    cart_selections: JSON.stringify(selections),
    cart_committed_groups: JSON.stringify(committedGroups),
  }
}

/** One immediate sync (what `syncOrderMetadata` did). Returns the updated order. */
export async function syncOrderMetadataNow(params: {
  config: CommerceLayerConfig
  order: Order
  license: LegacyLicenseBuffer
  selections: SelectionBuffer
  committedGroups: LegacyCommittedGroups
}): Promise<Order> {
  const { config, order, ...rest } = params
  const cl = getCommerceLayer(config)
  return cl.orders.update({
    id: order.id,
    metadata: buildLegacyMetadataPayload({ order, ...rest }),
  })
}

/**
 * The debounced background sync effect. Only runs once hydration finished
 * (`isInitialized`) and an order exists.
 */
export function useOrderMetadataSync({
  config,
  order,
  license,
  selections,
  committedGroups,
  isInitialized,
  onOrderUpdated,
  debounceMs = 1500,
}: {
  config: CommerceLayerConfig
  order: Order | undefined
  license: LegacyLicenseBuffer
  selections: SelectionBuffer
  committedGroups: LegacyCommittedGroups
  isInitialized: () => boolean
  onOrderUpdated: (order: Order) => void
  debounceMs?: number
}): void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSyncedHashRef = useRef('')

  useEffect(() => {
    if (!isInitialized() || !order?.id) return
    const hash = legacyMetadataSyncHash({
      committedGroups,
      selections,
      license,
    })
    if (hash === lastSyncedHashRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const updated = await syncOrderMetadataNow({
          config,
          order,
          license,
          selections,
          committedGroups,
        })
        lastSyncedHashRef.current = hash
        onOrderUpdated(updated)
      } catch {
        // Non-blocking: the sync was best-effort (this is how drift went unnoticed)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [
    config,
    order,
    license,
    selections,
    committedGroups,
    isInitialized,
    onOrderUpdated,
    debounceMs,
  ])
}
