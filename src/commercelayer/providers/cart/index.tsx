'use client'
import type { ClonePayload } from '@/commercelayer/utils/cart-share'
import {
  calculateDiscount,
  calculateLineItemPrice,
} from '@/commercelayer/utils/prices'
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
import {
  normalizeDraft,
  pickStyles,
  removeStylesFromGroup,
  restoreStyles,
} from './utils/cart-draft'

/** How long the "Undo" toast stays after a removal */
const UNDO_TOAST_MS = 8000

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
  /** The cart as the user sees it: the order with unsaved edits applied */
  selections: SelectionBuffer
  groupResolutions: GroupResolutions
  /** An order write is queued/running, or the draft is being saved */
  hasPendingWrites: boolean
  // --- Draft: cart edits are staged locally until `save()` ("Update cart") ---
  /** Fonts with unsaved edits (a pending removal counts) */
  dirtyFonts: string[]
  /** There are unsaved edits */
  isDirty: boolean
  /** `save()` is running; edits are ignored until it settles */
  isSaving: boolean
  /** Fonts written so far / total, while saving */
  saveProgress?: { done: number; total: number }
  /** Why the last save stopped (the unsaved fonts stay dirty) */
  saveError?: string
  /**
   * Write every dirty font to Commerce Layer, one at a time (removals first).
   * Stops at the first failure and keeps the remaining fonts dirty.
   */
  save: () => Promise<CartWriteResult>
  /** Throw away all unsaved edits */
  discard: () => void
  // Edits are staged in the draft (instant, undoable), not written
  removeStyles: (params: { parentUid: string; skuCodes: string[] }) => void
  removeFont: (parentUid: string) => void
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => void
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

  // --- Cart-page edits (staged in a draft, written by `save()`) ---
  // Edits only touch `draft`: `{ [parentUid]: StyleGroup }` for the fonts the
  // user changed (an empty group is a pending removal). `selections` is the
  // order with the draft applied, so edits are instant. Nothing is written to
  // Commerce Layer until `save()` ("Update cart"), which rewrites each dirty
  // font once.
  //
  // The order stays the source of truth: draft entries equal to the order are
  // not edits (see `normalizeDraft`), and the buy dialog seeds its own draft
  // from the order, so `save()` must run before the user opens it (the cart's
  // "Add More Styles" does that). This provider lives for every /cart/* route
  // (including the buy dialog over the cart); leaving /cart/* discards the
  // draft, like the buy dialog's draft. Reload / back are deliberately not
  // guarded: discarding just leaves the cart as it was saved.
  const [draft, setDraft] = useState<SelectionBuffer>({})
  const draftRef = useRef(draft)
  const [isSaving, setIsSaving] = useState(false)
  // Read by edit handlers, which must ignore edits while saving
  const isSavingRef = useRef(false)
  const [saveProgress, setSaveProgress] = useState<
    { done: number; total: number } | undefined
  >(undefined)
  const [saveError, setSaveError] = useState<string | undefined>(undefined)
  // A second `save()` while one is running joins it instead of writing twice
  const inFlightRef = useRef<Promise<CartWriteResult> | null>(null)

  const updateDraft = useCallback((next: SelectionBuffer) => {
    draftRef.current = next
    setDraft(next)
  }, [])

  const effectiveDraft = useMemo(
    () => normalizeDraft(orderSelections, draft),
    [orderSelections, draft]
  )
  const dirtyFonts = useMemo(
    () => Object.keys(effectiveDraft),
    [effectiveDraft]
  )
  const isDirty = dirtyFonts.length > 0

  const selections = useMemo(
    () => applySelectionOverlay(orderSelections, effectiveDraft),
    [orderSelections, effectiveDraft]
  )
  const itemsCount = useMemo(() => countSelections(selections), [selections])
  const hasPendingWrites = orderHasPendingWrites || isSaving

  /** A font's styles as the user currently sees them (draft, else order) */
  const currentFontGroup = useCallback(
    (parentUid: string): StyleGroup => {
      const fromOrder = deriveSelectionsFromOrder(getSnapshot().order)
      const current = normalizeDraft(fromOrder, draftRef.current)
      return parentUid in current
        ? current[parentUid]
        : (fromOrder[parentUid] ?? {})
    },
    [getSnapshot]
  )

  /** Replace a font's styles in the draft */
  const stageFont = useCallback(
    (parentUid: string, group: StyleGroup) => {
      const fromOrder = deriveSelectionsFromOrder(getSnapshot().order)
      updateDraft(
        normalizeDraft(fromOrder, { ...draftRef.current, [parentUid]: group })
      )
      setSaveError(undefined)
    },
    [getSnapshot, updateDraft]
  )

  /** Undo a removal: merge the removed styles back into the font's current ones */
  const restoreRemoved = useCallback(
    (parentUid: string, removed: StyleGroup) => {
      if (isSavingRef.current) return
      stageFont(
        parentUid,
        restoreStyles(currentFontGroup(parentUid), removed)
      )
    },
    [currentFontGroup, stageFont]
  )

  /** Stage a removal and offer to undo it */
  const stageRemoval = useCallback(
    (
      parentUid: string,
      next: StyleGroup,
      removed: StyleGroup,
      label: string
    ) => {
      if (Object.keys(removed).length === 0) return
      stageFont(parentUid, next)
      toaster.create({
        type: 'info',
        title: `Removed ${label}`,
        duration: UNDO_TOAST_MS,
        action: {
          label: 'Undo',
          onClick: () => restoreRemoved(parentUid, removed),
        },
      })
    },
    [stageFont, restoreRemoved]
  )

  const removeStyles = useCallback(
    (params: { parentUid: string; skuCodes: string[] }) => {
      if (isSavingRef.current) return
      const group = currentFontGroup(params.parentUid)
      const removed = pickStyles(group, params.skuCodes)
      const removedEntries = Object.values(removed)
      stageRemoval(
        params.parentUid,
        removeStylesFromGroup(group, params.skuCodes),
        removed,
        removedEntries.length === 1
          ? removedEntries[0].name
          : `${removedEntries.length} styles`
      )
    },
    [currentFontGroup, stageRemoval]
  )

  const removeFont = useCallback(
    (parentUid: string) => {
      if (isSavingRef.current) return
      const group = currentFontGroup(parentUid)
      stageRemoval(
        parentUid,
        {},
        group,
        Object.values(group)[0]?.parentName || 'font'
      )
    },
    [currentFontGroup, stageRemoval]
  )

  const setStyleLicenseTypes = useCallback(
    (params: {
      parentUid: string
      skuCode: string
      licenseTypes: string[]
    }) => {
      if (isSavingRef.current) return
      const group = currentFontGroup(params.parentUid)
      const entry = group[params.skuCode]
      if (!entry) return

      // A style without any license type would be priced at zero
      if (params.licenseTypes.length === 0) {
        toaster.create({
          type: 'info',
          title: 'Each style needs at least one license type',
        })
        return
      }

      stageFont(params.parentUid, {
        ...group,
        [params.skuCode]: { ...entry, licenseTypes: params.licenseTypes },
      })
    },
    [currentFontGroup, stageFont]
  )

  /** Throw away all unsaved edits */
  const discard = useCallback(() => {
    if (isSavingRef.current) return
    updateDraft({})
    setSaveError(undefined)
  }, [updateDraft])

  /**
   * Write every dirty font to Commerce Layer through the order's mutation
   * queue: removals first, then commits, one font at a time. A font leaves the
   * draft as soon as it is written (the refetched order has taken over), so a
   * failure keeps only the unwritten fonts dirty.
   */
  const save = useCallback((): Promise<CartWriteResult> => {
    if (inFlightRef.current) return inFlightRef.current

    const fromOrder = deriveSelectionsFromOrder(getSnapshot().order)
    const dirty = Object.keys(normalizeDraft(fromOrder, draftRef.current))
    if (dirty.length === 0) return Promise.resolve({ success: true })

    const isRemoval = (uid: string) =>
      Object.keys(draftRef.current[uid] ?? {}).length === 0
    const ordered = [
      ...dirty.filter(isRemoval),
      ...dirty.filter((uid) => !isRemoval(uid)),
    ]

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(undefined)
    setSaveProgress({ done: 0, total: ordered.length })

    const promise = (async (): Promise<CartWriteResult> => {
      try {
        for (let i = 0; i < ordered.length; i++) {
          const uid = ordered[i]
          const group = draftRef.current[uid] ?? {}

          let result: CartWriteResult
          try {
            result =
              Object.keys(group).length === 0
                ? await removeGroup(uid)
                : await commitGroup(uid, group)
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

          if (!result.success) {
            setSaveError(
              result.error?.message ?? 'Your cart could not be updated'
            )
            return result
          }

          const rest = { ...draftRef.current }
          delete rest[uid]
          updateDraft(rest)
          setSaveProgress({ done: i + 1, total: ordered.length })
        }
        return { success: true }
      } finally {
        isSavingRef.current = false
        inFlightRef.current = null
        setIsSaving(false)
        setSaveProgress(undefined)
      }
    })()
    inFlightRef.current = promise
    return promise
  }, [getSnapshot, commitGroup, removeGroup, updateDraft])

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

      // The import replaces the whole cart: let an in-flight save finish, then
      // drop any unsaved edits
      if (inFlightRef.current)
        await inFlightRef.current.catch(() => undefined)
      updateDraft({})
      setSaveError(undefined)

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
      updateDraft,
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
        hasPendingWrites,
        dirtyFonts,
        isDirty,
        isSaving,
        saveProgress,
        saveError,
        save,
        discard,
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
