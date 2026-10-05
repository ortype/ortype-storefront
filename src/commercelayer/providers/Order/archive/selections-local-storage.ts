/**
 * ARCHIVED — not imported anywhere. See `./index.ts` for context.
 *
 * The localStorage half of the retired selections sync. `OrderProvider` used
 * to mirror `selections` and `committedGroups` into localStorage on every
 * change and re-hydrate them in `initializeProvider`:
 *
 *   `${persistKey}_selections`        -> SelectionBuffer
 *   `${persistKey}_committed_groups`  -> CommittedGroups (line item ids are
 *                                        validated against the live order)
 *
 * localStorage was "primary" and `order.metadata` the cross-device fallback
 * (see `order-metadata-sync.ts`). A stored-but-empty `_selections` key was
 * treated as authoritative ("the user intentionally cleared everything");
 * only a *missing* key fell through to metadata.
 */
import type { Order } from '@commercelayer/sdk'
import { useEffect } from 'react'
import type { LicenseSize, SelectionBuffer } from '../types'

/** The committed-group shape as it was persisted (pre-`signature` rename) */
export type LegacyCommittedGroup = {
  /** Hash of the group's buffer state at commit time */
  hash: string
  /** CL line item IDs belonging to this group */
  lineItemIds: string[]
  /** The order-wide size these line items were priced at */
  size?: LicenseSize
}

export type LegacyCommittedGroups = {
  [parentUid: string]: LegacyCommittedGroup
}

export const legacyStorageKeys = (persistKey: string) => ({
  selections: `${persistKey}_selections`,
  committedGroups: `${persistKey}_committed_groups`,
})

/**
 * Read stored selections. Returns `null` when the key is missing (new device),
 * and `{}` when the user intentionally cleared everything.
 */
export function readStoredSelections(
  persistKey: string
): SelectionBuffer | null {
  try {
    const stored = localStorage.getItem(
      legacyStorageKeys(persistKey).selections
    )
    if (stored === null) return null
    return JSON.parse(stored) as SelectionBuffer
  } catch {
    return null // localStorage unavailable or corrupted
  }
}

/** Drop committed groups whose line items no longer exist on the order */
export function validateCommittedGroups(
  committed: LegacyCommittedGroups,
  order: Order
): LegacyCommittedGroups {
  const orderLineItemIds = new Set(
    (order.line_items ?? [])
      .filter((li) => li.item_type === 'skus' || li.item_type === 'bundles')
      .map((li) => li.id)
  )
  const validated: LegacyCommittedGroups = {}
  for (const [uid, group] of Object.entries(committed)) {
    const validIds = group.lineItemIds.filter((id) =>
      orderLineItemIds.has(id)
    )
    if (validIds.length > 0) {
      validated[uid] = { ...group, lineItemIds: validIds }
    }
  }
  return validated
}

export function readStoredCommittedGroups(
  persistKey: string,
  order: Order
): LegacyCommittedGroups {
  try {
    const stored = localStorage.getItem(
      legacyStorageKeys(persistKey).committedGroups
    )
    if (!stored) return {}
    return validateCommittedGroups(
      JSON.parse(stored) as LegacyCommittedGroups,
      order
    )
  } catch {
    return {}
  }
}

/** Remove both keys (used when a placed order reset the cart) */
export function clearStoredSelections(persistKey: string): void {
  try {
    const keys = legacyStorageKeys(persistKey)
    localStorage.removeItem(keys.selections)
    localStorage.removeItem(keys.committedGroups)
  } catch {
    /* localStorage unavailable */
  }
}

/**
 * The write side: an immediate localStorage write on every change, guarded by
 * `isInitialized` so the empty initial state never overwrites saved data
 * before hydration completes (this was `selectionsInitializedRef.current`).
 */
export function useSelectionsLocalStorage({
  persistKey,
  selections,
  committedGroups,
  isInitialized,
}: {
  persistKey: string
  selections: SelectionBuffer
  committedGroups: LegacyCommittedGroups
  isInitialized: () => boolean
}): void {
  const keys = legacyStorageKeys(persistKey)

  useEffect(() => {
    if (!isInitialized()) return
    try {
      localStorage.setItem(keys.selections, JSON.stringify(selections))
    } catch {
      /* localStorage unavailable */
    }
  }, [selections, keys.selections, isInitialized])

  useEffect(() => {
    if (!isInitialized()) return
    try {
      localStorage.setItem(
        keys.committedGroups,
        JSON.stringify(committedGroups)
      )
    } catch {
      /* localStorage unavailable */
    }
  }, [committedGroups, keys.committedGroups, isInitialized])
}
