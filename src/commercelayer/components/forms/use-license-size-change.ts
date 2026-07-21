import { LicenseSize, useOrderContext } from '@/commercelayer/providers/Order'
import { useCallback, useState } from 'react'

/**
 * Confirm-before-apply flow for the order-wide license size.
 *
 * License size affects the price of every cart item, so changing it while
 * committed items already exist should warn the user first. On confirm we only
 * update the size (state-only) — no eager re-commit. Line items are re-priced
 * lazily: incrementally when the user next edits a font (its "Update cart"
 * commit picks up the current size) and, as a catch-all, by the checkout sweep
 * (`commitSelections`).
 *
 * Shared by both size selectors (`LicenseSizeList` on /buy, `LicenseSizeSelect`
 * in the cart) so the behaviour stays consistent.
 */
export function useLicenseSizeChange(opts?: {
  onResolved?: (applied: boolean) => void
}) {
  const { committedGroups, licenseSize, setLicenseSize } = useOrderContext()

  // The tentative size awaiting confirmation, and whether the dialog is open.
  const [pendingSize, setPendingSize] = useState<LicenseSize | undefined>(
    undefined
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  // "Items already exist" is order-wide: any committed font group counts, so a
  // size change on /buy is confirmed even when only other fonts are committed.
  const hasCommittedItems = Object.keys(committedGroups).length > 0

  const requestSizeChange = useCallback(
    (next?: LicenseSize) => {
      if (!hasCommittedItems) {
        // Nothing committed yet — apply immediately (no dialog needed).
        setLicenseSize({ licenseSize: next })
        opts?.onResolved?.(true) // empty-cart: applied immediately
        return
      }
      // Stash the tentative size and confirm before applying.
      setPendingSize(next)
      setConfirmOpen(true)
    },
    [hasCommittedItems, setLicenseSize, opts]
  )

  const confirm = useCallback(() => {
    setLicenseSize({ licenseSize: pendingSize })
    setPendingSize(undefined)
    setConfirmOpen(false)
    opts?.onResolved?.(true) // applied
  }, [pendingSize, setLicenseSize, opts])

  const cancel = useCallback(() => {
    // Drop the tentative size; the committed size stays in effect.
    setPendingSize(undefined)
    setConfirmOpen(false)
    opts?.onResolved?.(false) // reverted
  }, [opts])

  // While the dialog is open show the tentative choice; otherwise the committed
  // size. Selectors bind their value to this so Cancel cleanly reverts without
  // any bespoke revert logic.
  const displayValue = confirmOpen ? pendingSize : licenseSize

  return {
    requestSizeChange,
    confirm,
    cancel,
    confirmOpen,
    pendingSize,
    displayValue,
  }
}
