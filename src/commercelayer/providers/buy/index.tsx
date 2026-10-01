import { reducer } from '@/commercelayer/providers/buy/reducer'
import {
  calculateDiscount,
  calculateLineItemPrice,
} from '@/commercelayer/utils/prices'
import { type Font } from '@/types'
import type { SkuOption } from '@commercelayer/sdk'
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import slugify from 'slugify'
import { useOrderContext, type AddToCartError } from '../Order'
import {
  pickSkuOptions,
  setGroupLicenseTypes,
  skuOptionRefs,
  toggleStyleInGroup,
  toggleStylesInGroup,
  type StyleGroup,
} from '../Order/selection-utils'
import type {
  FontSelectionSummary,
  GroupPriceSummary,
  ResolvedFontGroup,
  StyleEntry,
} from '../Order/types'
import { computeGroupHash } from '../Order/utils'

/** Minimal params for toggling a single style — font-level context is auto-filled */
export interface ToggleStyleParams {
  skuCode: string
  name: string
  className?: string
}

export interface CommitResult {
  success: boolean
  error?: AddToCartError
}

export interface BuyProviderData {
  font: Font
  baseUnitCents: number
  isLoading: boolean
  /** Selected styles for this font, keyed by skuCode */
  selectedSkus: { [skuCode: string]: StyleEntry }
  /** Derived price/count summary for this font's selections */
  summary: FontSelectionSummary
  /** Toggle a single style in/out of the buffer */
  toggleStyle: (params: ToggleStyleParams) => void
  /** Toggle an entire group (font family or subfamily) */
  toggleGroup: (styles: ToggleStyleParams[]) => void
  /** Pre-computed "full family" price summary */
  fullFamilySummary: GroupPriceSummary
  /** Pre-computed group summaries keyed by groupName */
  groupSummaries: { [groupName: string]: GroupPriceSummary }
  /** Draft license types for this font (not order-wide until saved) */
  licenseSkuOptions: SkuOption[]
  /** Change the draft license types; stamps them on every draft style */
  setLicenseSkuOptions: (options: SkuOption[]) => void
  hasLicenseOwner: boolean
  hasLicenseSize: boolean
  hasLicenseTypes: boolean
  /** Owner + size set and at least one draft license type chosen */
  canSelect: boolean
  /** The draft has at least one selected style */
  hasFontSelections: boolean
  /** This font has committed line items in the cart */
  isCommitted: boolean
  /** Draft differs from the cart (unsaved edits, or pending removal) */
  isDirty: boolean
  /** The dirty draft can be written to the cart right now (see `commit`) */
  canCommit: boolean
  /** A save / remove / commit is in flight */
  isCommitting: boolean
  /** Commit the draft: "Add to cart" / "Update cart" */
  save: () => Promise<CommitResult>
  /** Remove this font from the cart */
  remove: () => Promise<CommitResult>
  /**
   * Write the dirty draft to the cart: `remove` when the draft is a pending
   * removal (empty draft on a committed font), otherwise `save`.
   */
  commit: () => Promise<CommitResult>
}

interface BuyProviderProps {
  font: Font
  children?: ReactNode
}

export interface AppStateData {
  isLoading: boolean
}

const initialState: AppStateData = {
  isLoading: false,
}

const BuyContext = createContext<BuyProviderData>({} as BuyProviderData)

export const useBuyContext = (): BuyProviderData => useContext(BuyContext)

/**
 * Interleave variants and italicVariants in display order, matching the
 * mergeVariants logic used by Typefaces: Regular, Regular Italic, Medium, …
 * This order is stored in includedSkuCodes so the cart can sort by it.
 */
function interleaveVariantIds(
  variants: Array<{ _id: string }>,
  italicVariants: Array<{ _id: string }>
): string[] {
  const ids: string[] = []
  const maxLen = Math.max(variants.length, italicVariants.length)
  for (let i = 0; i < maxLen; i++) {
    if (i < variants.length && variants[i]._id) ids.push(variants[i]._id)
    if (i < italicVariants.length && italicVariants[i]._id)
      ids.push(italicVariants[i]._id)
  }
  return ids
}

/**
 * Resolve a font's style groups into ResolvedFontGroup[] for projection
 * compilation. Uses the same slugify as the import utility for consistency.
 * includedSkuCodes is stored in interleaved display order so both the buy
 * page and the cart can sort by index without extra data.
 */
function resolveFontGroups(font: Font): ResolvedFontGroup[] {
  if (font.styleGroups?.length) {
    return font.styleGroups.map((sg) => {
      const groupName = sg.groupName || 'Standard'
      const groupSlug = slugify(groupName, { lower: true })
      const variantIds = interleaveVariantIds(
        sg.variants || [],
        sg.italicVariants || []
      )
      return {
        groupName,
        groupSlug,
        groupSkuCode: `${font._id}--group--${groupSlug}`,
        includedSkuCodes: variantIds,
      }
    })
  }

  // Default Standard group containing all variants
  if (font.variants?.length) {
    const variantIds = font.variants.map((v) => v._id).filter(Boolean)
    return [
      {
        groupName: 'Standard',
        groupSlug: 'standard',
        groupSkuCode: `${font._id}--group--standard`,
        includedSkuCodes: variantIds,
      },
    ]
  }

  return []
}

export const BuyProvider: FC<BuyProviderProps> = ({ font, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    skuOptions,
    selectedSkuOptions: defaultSkuOptions,
    licenseSize,
    hasLicenseOwner,
    selections,
    committedGroups,
    registerGroupResolutions,
    commitGroup,
    removeGroup,
  } = useOrderContext()

  const fontUid = font.uid!

  // Resolve and register group resolutions when the font loads
  useEffect(() => {
    if (!font?._id || !font?.uid) return
    const groups = resolveFontGroups(font)
    if (groups.length > 0) {
      registerGroupResolutions(font.uid, groups)
    }
  }, [font?._id, font?.uid, registerGroupResolutions])

  // ── Draft buffer ─────────────────────────────────────────────────────────
  // Unsaved edits for THIS font live here, not in the OrderProvider's
  // `selections`, so nothing is persisted (localStorage / order metadata) until
  // `save()` succeeds. Closing the dialog, navigating away, or reloading simply
  // discards the draft, so no cleanup effect is needed.
  //
  // Seeded from `selections[fontUid]` on mount (BuyContainer keys this provider
  // by font uid, so switching fonts re-seeds). Cart-page edits made before the
  // dialog opened are therefore preserved in the draft.
  const [draft, setDraft] = useState<StyleGroup>(
    () => selections[fontUid] ?? {}
  )

  /** Order refs canonically (skuOptions order) and drop unknown refs */
  const canonicalTypes = useCallback(
    (refs: string[]): string[] =>
      skuOptionRefs(pickSkuOptions(skuOptions, refs)),
    [skuOptions]
  )

  // Font-level license types for the draft. Seeded from this font's existing
  // styles (first entry), else the order-wide default. The order default is
  // only updated when the draft is saved.
  const [draftTypes, setDraftTypes] = useState<string[]>(() => {
    const firstEntry = Object.values(selections[fontUid] ?? {})[0]
    return canonicalTypes(
      firstEntry?.licenseTypes?.length
        ? firstEntry.licenseTypes
        : skuOptionRefs(defaultSkuOptions)
    )
  })

  // Draft-scoped license types as SkuOptions. Everything below that prices or
  // gates on "selected license types" uses this, not the order-wide default.
  const selectedSkuOptions = useMemo(
    () => pickSkuOptions(skuOptions, draftTypes),
    [skuOptions, draftTypes]
  )

  /** Change the draft's license types and stamp them on every draft style */
  const setLicenseSkuOptions = useCallback(
    (options: SkuOption[]) => {
      const refs = canonicalTypes(skuOptionRefs(options))
      setDraftTypes(refs)
      setDraft((prev) => setGroupLicenseTypes(prev, refs))
    },
    [canonicalTypes]
  )

  const selectedSkus = draft

  /** Build the StyleEntry metadata shared by both toggle helpers */
  const buildStyleEntry = useCallback(
    (params: ToggleStyleParams): StyleEntry => ({
      licenseTypes: draftTypes,
      parentName: font.shortName ?? font.name,
      className: params.className ?? '',
      name: params.name,
      defaultVariantId: font.defaultVariant?._id ?? '',
    }),
    [draftTypes, font.shortName, font.name, font.defaultVariant?._id]
  )

  /** Toggle a single style in/out of the draft */
  const toggleStyle = useCallback(
    (params: ToggleStyleParams) => {
      setDraft((prev) =>
        toggleStyleInGroup(prev, params.skuCode, buildStyleEntry(params))
      )
    },
    [buildStyleEntry]
  )

  /** Toggle an entire group (font family or subfamily) in the draft */
  const toggleGroup = useCallback(
    (styles: ToggleStyleParams[]) => {
      if (styles.length === 0) return
      setDraft((prev) =>
        toggleStylesInGroup(
          prev,
          styles.map((s) => ({
            skuCode: s.skuCode,
            styleMetadata: buildStyleEntry(s),
          }))
        )
      )
    },
    [buildStyleEntry]
  )

  // ── Save / remove ────────────────────────────────────────────────────────
  const committed = committedGroups[fontUid]
  const isCommitted = !!committed
  const hasDraftStyles = Object.keys(draft).length > 0
  const draftHash = useMemo(() => computeGroupHash(draft), [draft])

  /**
   * The draft differs from what's in the cart: unsaved additions/edits, or
   * (empty draft + committed) a pending removal.
   */
  const isDirty = hasDraftStyles ? committed?.hash !== draftHash : isCommitted

  const hasLicenseSize = !!licenseSize?.value

  const hasLicenseTypes = selectedSkuOptions.length > 0

  /** Owner + size (order-wide) and at least one draft license type are set */
  const canSelect =
    hasLicenseOwner && !!licenseSize?.value && selectedSkuOptions.length > 0

  /**
   * A dirty draft can only be written when it is a removal (needs nothing but
   * the font uid) or when owner/size/types are all set, since `commitGroup`
   * prices line items from them.
   */
  const canCommit = isDirty && ((isCommitted && !hasDraftStyles) || canSelect)

  // ── Commit tracking ──────────────────────────────────────────────────────
  // `isCommitting` lives here (not in a component) so every entry point — the
  // summary buttons and the discard-draft dialog — shares one source of truth.
  // The in-flight promise is also kept so a second request while a commit is
  // running joins it instead of firing a duplicate cart write.
  const [isCommitting, setIsCommitting] = useState(false)
  const inFlightRef = useRef<Promise<CommitResult> | null>(null)

  const track = useCallback(
    (action: () => Promise<CommitResult>): Promise<CommitResult> => {
      if (inFlightRef.current) return inFlightRef.current
      setIsCommitting(true)
      const promise = (async (): Promise<CommitResult> => {
        try {
          const result = await action()
          if (!result.success) {
            console.error('[Buy] cart update failed:', result.error)
          }
          return result
        } catch (e) {
          console.error('[Buy] cart update error:', e)
          return {
            success: false,
            error: {
              message: e instanceof Error ? e.message : 'Cart update failed',
              originalError: e,
            },
          }
        } finally {
          inFlightRef.current = null
          setIsCommitting(false)
        }
      })()
      inFlightRef.current = promise
      return promise
    },
    []
  )

  /** Commit the draft (Add / Update cart). The draft is kept on failure. */
  const save = useCallback(
    () =>
      track(() => commitGroup(fontUid, draft, { licenseTypes: draftTypes })),
    [track, commitGroup, fontUid, draft, draftTypes]
  )

  /** Remove this font from the cart (deletes committed line items) */
  const remove = useCallback(
    () =>
      track(async () => {
        const result = await removeGroup(fontUid)
        if (result.success) setDraft({})
        return result
      }),
    [track, removeGroup, fontUid]
  )

  /** Empty draft on a committed font: the pending change is a removal */
  const isPendingRemoval = isCommitted && !hasDraftStyles

  /** Write the dirty draft to the cart, whichever way it needs to go */
  const commit = useCallback(
    () => (isPendingRemoval ? remove() : save()),
    [isPendingRemoval, remove, save]
  )

  // Still compute unitPrice/nextUnitPrice even with 0 selections
  // so the UI can show "what it would cost" for the first add
  const baseUnitCents = useMemo(() => {
    return licenseSize?.modifier && selectedSkuOptions?.length
      ? calculateLineItemPrice({
          skuOptions: selectedSkuOptions,
          sizeModifier: licenseSize.modifier,
          count: 1,
        })
      : 0
  }, [licenseSize, selectedSkuOptions])

  /** Derived price/count summary computed from the selection buffer */
  const summary = useMemo<FontSelectionSummary>(() => {
    const styleCount = Object.keys(selectedSkus).length

    if (
      !licenseSize?.modifier ||
      !selectedSkuOptions?.length ||
      styleCount === 0
    ) {
      return {
        show: false,
        fontStyleCount: 0,
        unitPriceCents: baseUnitCents,
        nextUnitPriceCents: baseUnitCents,
        subtotalCents: 0,
        percentageDiscount: 0,
        totalDiscountCents: 0,
        totalCents: 0,
      }
    }

    // Unit price at current count
    const unitPriceCents = calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: styleCount,
    })

    // Unit price if one more style were added
    const nextUnitPriceCents = calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: styleCount + 1,
    })

    // Subtotal: full price as if each style had no discount (count=1)
    const fullPriceCents = calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: 1,
    })

    const subtotalCents = fullPriceCents * styleCount

    // Total: discounted price × count
    const totalCents = unitPriceCents * styleCount

    const discount = Math.round(calculateDiscount(styleCount) * 100)

    return {
      show: true,
      fontStyleCount: styleCount,
      unitPriceCents,
      nextUnitPriceCents,
      fullPriceCents,
      subtotalCents,
      percentageDiscount: discount,
      totalDiscountCents: subtotalCents - totalCents,
      totalCents,
    }
  }, [selectedSkus, selectedSkuOptions, licenseSize])

  /** A group's discounted total, its undiscounted (count=1) reference total,
   * and the actual discount percentage those two imply — all in display
   * units (EUR / 0–1). Reuses `calculateLineItemPrice` — the same source of
   * truth CL uses to actually charge — so these previews can never diverge
   * from what the customer is charged once they select the group, and the
   * displayed percentage always matches the actual (rounded) prices shown
   * alongside it.
   *
   * `otherSelectedCount` is the number of styles already selected elsewhere
   * in this font (outside of the group being priced). It's folded into the
   * count used to look up the discount rate so the projection reflects what
   * the discount WOULD BE if every style in this group were selected *in
   * combination with* whatever else is already selected — without double
   * counting styles that are both already selected and part of this group
   * (styleCount already assumes the group is selected in full). totalPrice
   * only reflects this group's own share of that combined total (unit price
   * at the combined count × this group's styleCount), not the whole font's
   * total. */
  const computeGroupPrices = (
    styleCount: number,
    otherSelectedCount = 0
  ): {
    fullPriceCents: number
    totalPriceCents: number
    percentageDiscount: number
  } => {
    if (
      !styleCount ||
      !licenseSize?.modifier ||
      !selectedSkuOptions?.length
    ) {
      return {
        fullPriceCents: 0,
        totalPriceCents: 0,
        percentageDiscount: 0,
      }
    }

    const projectedCount = styleCount + Math.max(0, otherSelectedCount)

    const fullUnitCents = calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: 1,
    })
    const unitPriceCents = calculateLineItemPrice({
      skuOptions: selectedSkuOptions,
      sizeModifier: licenseSize.modifier,
      count: projectedCount,
    })
    return {
      fullPriceCents: fullUnitCents * styleCount,
      totalPriceCents: unitPriceCents * styleCount,
      // Whole percentage points (0-100), matching FontSelectionSummary and
      // the cart provider's percentageDiscount convention.
      percentageDiscount:
        fullUnitCents > 0
          ? Math.round((1 - unitPriceCents / fullUnitCents) * 100)
          : 0,
    }
  }

  /** Pre-computed "full family" group summary */
  const fullFamilySummary = useMemo<GroupPriceSummary>(() => {
    const styleCount = font.variants?.length || 0
    const allSelected =
      styleCount > 0 && Object.keys(selectedSkus).length === styleCount
    // The "full family" group spans every style in the font, so there's
    // nothing selected outside of it to combine with.
    const { fullPriceCents, totalPriceCents, percentageDiscount } =
      computeGroupPrices(styleCount)
    return {
      styleCount,
      allSelected,
      countSelected: Object.keys(selectedSkus).length,
      percentageDiscount,
      fullPriceCents,
      totalPriceCents,
    }
  }, [font.variants, selectedSkus, selectedSkuOptions, licenseSize])

  /** Pre-computed group summaries keyed by groupName */
  const groupSummaries = useMemo<{
    [groupName: string]: GroupPriceSummary
  }>(() => {
    if (!font.styleGroups) return {}
    const result: {
      [groupName: string]: GroupPriceSummary
    } = {}
    const totalSelectedInFont = Object.keys(selectedSkus).length
    for (const group of font.styleGroups) {
      const styleCount =
        (group.variants?.length || 0) + (group.italicVariants?.length || 0)
      const allVariantIds = [
        ...(group.variants || []).map((v) => v._id),
        ...(group.italicVariants || []).map((v) => v._id),
      ]
      const allSelected =
        styleCount > 0 && allVariantIds.every((id) => id in selectedSkus)
      const countSelected = allVariantIds.filter(
        (id) => id in selectedSkus
      ).length

      // Styles already selected elsewhere in the font, excluding this
      // group's own (already-counted) selections, so they aren't counted
      // twice when projecting the combined discount.
      const otherSelectedCount = totalSelectedInFont - countSelected

      const { fullPriceCents, totalPriceCents, percentageDiscount } =
        computeGroupPrices(styleCount, otherSelectedCount)

      result[group.groupName] = {
        styleCount,
        allSelected,
        countSelected,
        percentageDiscount,
        fullPriceCents,
        totalPriceCents,
      }
    }
    return result
  }, [font.styleGroups, selectedSkus, selectedSkuOptions, licenseSize])

  return (
    <BuyContext.Provider
      value={{
        ...state,
        font,
        selectedSkus,
        baseUnitCents,
        summary,
        toggleStyle,
        toggleGroup,
        fullFamilySummary,
        groupSummaries,
        licenseSkuOptions: selectedSkuOptions,
        setLicenseSkuOptions,
        hasLicenseOwner,
        hasLicenseSize,
        hasLicenseTypes,
        canSelect,
        hasFontSelections: hasDraftStyles,
        isCommitted,
        isDirty,
        canCommit,
        isCommitting,
        save,
        remove,
        commit,
      }}
    >
      {children}
    </BuyContext.Provider>
  )
}
