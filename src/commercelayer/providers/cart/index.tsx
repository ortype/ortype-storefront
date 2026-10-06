'use client'
import {
  calculateDiscount,
  calculateLineItemPrice,
} from '@/commercelayer/utils/prices'
import type { ClonePayload } from '@/commercelayer/utils/cart-share'
import { toaster } from '@/components/ui/toaster'
import type { BuyLabels, CartLabels, MediaType } from '@/sanity/lib/queries'
import type { Order, SkuOption } from '@commercelayer/sdk'
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useOrderContext } from '@/commercelayer/providers/order'
import type {
  CartWriteResult,
  GroupResolutions,
  LicenseOwnerInput,
  LicenseSize,
  SelectionBuffer,
  StyleEntry,
  StyleGroup,
} from '@/commercelayer/providers/order/types'
import {
  applySelectionOverlay,
  deriveSelectionsFromOrder,
} from '@/commercelayer/providers/order/utils/derive-selections'
import {
  countSelections,
  pickSkuOptions,
  skuOptionRefs,
} from '@/commercelayer/providers/order/utils/selection-utils'
import type {
  CartBufferGroup,
  CartBufferItem,
  CartSubFamilyGroup,
} from './types'

export type {
  CartBufferGroup,
  CartBufferItem,
  CartSubFamilyGroup,
} from './types'

export interface CartProviderData {
  isLoading: boolean
  orderId?: string
  order?: Order
  /** Computed, sorted, grouped representation of the selection buffer */
  groupedLineItems: CartBufferGroup[]
  // License form — forwarded for CartComponent
  isLicenseForClient: boolean
  licenseOwner?: LicenseOwnerInput
  itemsCount: number
  allLicenseInfoSet: boolean
  licenseSize?: LicenseSize
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  buyLabels?: BuyLabels
  cartLabels?: CartLabels
  // Forwarded for CartItem / CartGroups
  skuOptions: SkuOption[]
  mediaTypes: MediaType[]
  /** The cart, derived from the order (with in-flight edits overlaid) */
  selections: SelectionBuffer
  groupResolutions: GroupResolutions
  /** Fonts whose last edit is still being written to Commerce Layer */
  pendingFonts: string[]
  /** An edit or reprice is queued/running (checkout should wait) */
  hasPendingWrites: boolean
  // Cart edits write through to Commerce Layer (optimistically reflected)
  removeStyles: (params: {
    parentUid: string
    skuCodes: string[]
  }) => Promise<CartWriteResult>
  removeFont: (parentUid: string) => Promise<CartWriteResult>
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => Promise<CartWriteResult>
  /**
   * Replace the whole cart with a cloned one (see `/cart/clone/[token]`):
   * clears the existing line items, registers the payload's group resolutions
   * and license info, defaults the license holder to "Yourself" when unset,
   * then creates the order if needed and commits every font to Commerce Layer.
   */
  importSelections: (payload: ClonePayload) => Promise<CartWriteResult>
}

interface CartProviderProps {
  children: React.ReactNode
}

export const CartContext = createContext<CartProviderData>(
  {} as CartProviderData
)

export const useCartContext = (): CartProviderData => useContext(CartContext)

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const {
    isLoading,
    orderId,
    order,
    allLicenseInfoSet,
    isLicenseForClient,
    licenseOwner,
    licenseSize,
    setLicenseSize,
    setLicenseOwner,
    setSelectedSkuOptions,
    buyLabels,
    cartLabels,
    selections: orderSelections,
    groupResolutions,
    registerGroupResolutions,
    skuOptions,
    mediaTypes,
    hasPendingWrites: orderHasPendingWrites,
    commitGroup,
    removeGroup,
    clearCommittedItems,
    ensureOrder,
    getSnapshot,
  } = useOrderContext()

  // --- Cart-page edits (write through to Commerce Layer) ---
  // Each edit is reflected immediately in `selections` through `overlay`, then
  // written through the order's mutation queue. The overlay entry is dropped
  // once the write settles (the refetched order has taken over), or if it
  // fails (the cart reverts to what is really on the order).
  const [overlay, setOverlay] = useState<{ [parentUid: string]: StyleGroup }>(
    {}
  )
  const overlayRef = useRef(overlay)
  // Latest edit per font; an older edit must not settle a newer one's overlay
  const intentTokenRef = useRef<Record<string, number>>({})

  const selections = useMemo(
    () => applySelectionOverlay(orderSelections, overlay),
    [orderSelections, overlay]
  )
  const itemsCount = useMemo(() => countSelections(selections), [selections])
  const pendingFonts = useMemo(() => Object.keys(overlay), [overlay])
  const hasPendingWrites = orderHasPendingWrites || pendingFonts.length > 0

  /** A font's styles as the user currently sees them (overlay, else order) */
  const currentFontGroup = useCallback(
    (parentUid: string): StyleGroup => {
      if (parentUid in overlayRef.current)
        return overlayRef.current[parentUid]
      return deriveSelectionsFromOrder(getSnapshot().order)[parentUid] ?? {}
    },
    [getSnapshot]
  )

  const setFontStyles = useCallback(
    async (
      parentUid: string,
      group: StyleGroup
    ): Promise<CartWriteResult> => {
      const token = (intentTokenRef.current[parentUid] ?? 0) + 1
      intentTokenRef.current[parentUid] = token

      overlayRef.current = { ...overlayRef.current, [parentUid]: group }
      setOverlay(overlayRef.current)

      let result: CartWriteResult
      try {
        result =
          Object.keys(group).length === 0
            ? await removeGroup(parentUid)
            : await commitGroup(parentUid, group)
      } catch (error) {
        result = {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update your cart',
            originalError: error,
          },
        }
      }

      // A newer edit for this font settles the overlay (and reports) instead
      if (intentTokenRef.current[parentUid] === token) {
        const rest = { ...overlayRef.current }
        delete rest[parentUid]
        overlayRef.current = rest
        setOverlay(rest)
        if (!result.success) {
          toaster.create({
            type: 'error',
            title: 'Your cart could not be updated',
            description: result.error?.message,
          })
        }
      }
      return result
    },
    [commitGroup, removeGroup]
  )

  const removeStyles = useCallback(
    (params: { parentUid: string; skuCodes: string[] }) => {
      const remove = new Set(params.skuCodes)
      const next: StyleGroup = {}
      for (const [code, entry] of Object.entries(
        currentFontGroup(params.parentUid)
      )) {
        if (!remove.has(code)) next[code] = entry
      }
      return setFontStyles(params.parentUid, next)
    },
    [currentFontGroup, setFontStyles]
  )

  const removeFont = useCallback(
    (parentUid: string) => setFontStyles(parentUid, {}),
    [setFontStyles]
  )

  const setStyleLicenseTypes = useCallback(
    async (params: {
      parentUid: string
      skuCode: string
      licenseTypes: string[]
    }): Promise<CartWriteResult> => {
      const group = currentFontGroup(params.parentUid)
      const entry = group[params.skuCode]
      if (!entry) return { success: true }

      // A style without any license type would be priced at zero
      if (params.licenseTypes.length === 0) {
        const message = 'Each style needs at least one license type'
        toaster.create({ type: 'info', title: message })
        return { success: false, error: { message } }
      }

      return setFontStyles(params.parentUid, {
        ...group,
        [params.skuCode]: { ...entry, licenseTypes: params.licenseTypes },
      })
    },
    [currentFontGroup, setFontStyles]
  )

  // --- Clone / import (replace the cart with a shared selection) ---
  const importingRef = useRef(false)

  const importSelections = useCallback(
    async (payload: ClonePayload): Promise<CartWriteResult> => {
      if (importingRef.current) {
        return {
          success: false,
          error: { message: 'A cart import is already in progress' },
        }
      }
      if (Object.keys(payload.selections).length === 0) {
        return {
          success: false,
          error: { message: 'Nothing to import' },
        }
      }

      importingRef.current = true
      try {
        // Replace: drop the existing line items first (keeps the order itself)
        const cleared = await clearCommittedItems()
        if (!cleared.success) return cleared

        // The order provider's setters update its state synchronously, so the
        // commits below see the payload's resolutions / size / types / owner.
        for (const [uid, groups] of Object.entries(
          payload.groupResolutions
        )) {
          registerGroupResolutions(uid, groups)
        }
        if (payload.licenseSize) {
          setLicenseSize({ licenseSize: payload.licenseSize })
        }
        if (payload.defaultLicenseTypes.length > 0) {
          setSelectedSkuOptions({
            selectedSkuOptions: pickSkuOptions(
              getSnapshot().skuOptions,
              payload.defaultLicenseTypes
            ),
          })
        }
        // The shared license holder is never copied: default to "Yourself"
        // unless the recipient already chose one.
        if (!getSnapshot().hasLicenseOwner) {
          setLicenseOwner({ licenseOwner: { is_client: false } })
        }

        // Create the order once up front; each commit then reuses it
        await ensureOrder(skuOptionRefs(getSnapshot().selectedSkuOptions))
        for (const uid of Object.keys(payload.selections)) {
          const result = await commitGroup(uid, payload.selections[uid])
          if (!result.success) return result // Bail on first failure
        }
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to import cart',
            originalError: error,
          },
        }
      } finally {
        importingRef.current = false
      }
    },
    [
      clearCommittedItems,
      registerGroupResolutions,
      setLicenseSize,
      setSelectedSkuOptions,
      setLicenseOwner,
      getSnapshot,
      ensureOrder,
      commitGroup,
    ]
  )

  /** Resolve a style's licenseType refs to SkuOption objects */
  const resolveSkuOptions = (entry: StyleEntry): SkuOption[] =>
    (entry.licenseTypes ?? [])
      .map((ref) => skuOptions?.find((o) => o.reference === ref))
      .filter(Boolean) as SkuOption[]

  // Build grouped, sorted, sub-grouped cart data from the selection buffer.
  // Mirrors the buy provider's per-font derived state, but spans all fonts.
  const groupedLineItems = useMemo<CartBufferGroup[]>(() => {
    const parentUids = Object.keys(selections)
    if (parentUids.length === 0) return []

    return parentUids.map((parentUid) => {
      const selectedSkus = selections[parentUid]
      const skuCodes = Object.keys(selectedSkus)
      const first = selectedSkus[skuCodes[0]]
      const count = skuCodes.length
      const modifier = licenseSize?.modifier ?? 0

      // Sum per-style prices using each style's own license types
      let fullTotalCents = 0
      let discountedTotalCents = 0

      for (const skuCode of skuCodes) {
        const styleOptions = resolveSkuOptions(selectedSkus[skuCode])
        if (styleOptions.length === 0) continue

        fullTotalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: modifier,
          count: 1,
        })
        discountedTotalCents += calculateLineItemPrice({
          skuOptions: styleOptions,
          sizeModifier: modifier,
          count,
        })
      }

      // Sort SKU codes into Sanity display order using pre-registered group resolutions.
      // includedSkuCodes is stored in interleaved order (see BuyProvider resolveFontGroups).
      const resolvedGroups = groupResolutions[parentUid] ?? []
      const allOrderedCodes = resolvedGroups.flatMap(
        (rg) => rg.includedSkuCodes
      )
      const skuOrder = new Map(allOrderedCodes.map((id, i) => [id, i]))
      const sortedSkuCodes = [...skuCodes].sort(
        (a, b) =>
          (skuOrder.get(a) ?? Infinity) - (skuOrder.get(b) ?? Infinity)
      )

      // Top-level allSelected: used when the font has no sub-groups
      const allSelected =
        allOrderedCodes.length > 0 &&
        allOrderedCodes.every((code) => code in selectedSkus)

      // Pre-compute which codes belong to a fully-selected resolved group so
      // isInFullGroup can be stamped onto each CartBufferItem without re-reading context.
      const fullySelectedGroupCodes = new Set<string>()
      for (const rg of resolvedGroups) {
        if (rg.includedSkuCodes.every((code) => code in selectedSkus)) {
          for (const code of rg.includedSkuCodes)
            fullySelectedGroupCodes.add(code)
        }
      }

      // Build fully-typed CartBufferItem[] in display order
      const items: CartBufferItem[] = sortedSkuCodes.map((skuCode) => ({
        skuCode,
        parentUid,
        entry: selectedSkus[skuCode],
        groupCount: count,
        isInFullGroup: fullySelectedGroupCodes.has(skuCode),
      }))

      const subGroupsRaw: CartSubFamilyGroup[] = resolvedGroups
        .map((rg) => ({
          groupName: rg.groupName,
          items: items.filter((item) =>
            rg.includedSkuCodes.includes(item.skuCode)
          ),
          // Per-subgroup: every code in this group's spec is selected
          allSelected:
            rg.includedSkuCodes.length > 0 &&
            rg.includedSkuCodes.every((code) => code in selectedSkus),
        }))
        .filter((sg) => sg.items.length > 0)
      const hasSubGroups = subGroupsRaw.length > 0

      return {
        parentUid,
        parentName: first?.parentName ?? '',
        defaultVariantId: first?.defaultVariantId ?? '',
        items,
        subGroups: hasSubGroups ? subGroupsRaw : [],
        hasSubGroups,
        allSelected,
        fullUnitPriceTotalCents: fullTotalCents,
        percentageDiscount: count
          ? Math.round(calculateDiscount(count) * 100)
          : 0,
        discountedPriceTotalCents: discountedTotalCents,
      }
    })
  }, [selections, groupResolutions, licenseSize?.modifier, skuOptions])

  return (
    <CartContext.Provider
      value={{
        isLoading,
        orderId,
        order,
        groupedLineItems,
        allLicenseInfoSet,
        itemsCount,
        isLicenseForClient,
        licenseOwner,
        licenseSize,
        setLicenseSize,
        buyLabels,
        cartLabels,
        skuOptions,
        mediaTypes,
        selections,
        groupResolutions,
        pendingFonts,
        hasPendingWrites,
        removeStyles,
        removeFont,
        setStyleLicenseTypes,
        importSelections,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
