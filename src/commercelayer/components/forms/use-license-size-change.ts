import { LicenseSize, useOrderContext } from '@/commercelayer/providers/Order'
import { toaster } from '@/components/ui/toaster'
import { useCallback, useState } from 'react'

/**
 * Confirm-before-apply flow for the order-wide license size.
 *
 * License size affects the price of every cart item, so changing it while
 * committed items already exist should warn the user first. On confirm we set
 * the size and immediately reprice every committed font on Commerce Layer
 * (`repriceAll`, serialized with every other cart write), so the order never
 * holds line items priced at a size the user no longer has selected.
 *
 * Shared by both size selectors (`LicenseSizeList` on /buy, `LicenseSizeSelect`
 * in the cart) so the behaviour stays consistent.
 */
export function useLicenseSizeChange(opts?: {
  onResolved?: (applied: boolean) => void
}) {
  const { committedGroups, licenseSize, setLicenseSize, repriceAll } =
    useOrderContext()

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
    // Reprice committed fonts at the new size (the order is the source of
    // truth). `setLicenseSize` has already updated the provider's latest
    // state, which the queued reprice reads.
    void repriceAll().then((result) => {
      if (!result.success) {
        toaster.create({
          type: 'error',
          title: 'Your cart could not be repriced',
          description: result.error?.message,
        })
      }
    })
  }, [pendingSize, setLicenseSize, repriceAll, opts])

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
