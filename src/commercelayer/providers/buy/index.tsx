import { ActionType, reducer } from '@/commercelayer/providers/buy/reducer'
import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Font } from '@/sanity/lib/queries'
import slugify from 'slugify'
import { createContext, FC, useContext, useEffect, useMemo, useReducer } from 'react'
import type {
  FontSelectionSummary,
  GroupPriceSummary,
  ResolvedFontGroup,
  StyleEntry,
} from '../Order/types'
import { useOrderContext } from '../Order'

/** Minimal params for toggling a single style — font-level context is auto-filled */
export interface ToggleStyleParams {
  skuCode: string
  name: string
  className?: string
}

export interface BuyProviderData {
  font: Font
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
}

interface BuyProviderProps {
  font: Font
  children?: JSX.Element[] | JSX.Element | null
}

export interface AppStateData {
  isLoading: boolean
}

const initialState: AppStateData = {
  isLoading: false,
}

const BuyContext = createContext<BuyProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as BuyProviderData
)

export const useBuyContext = (): BuyProviderData => useContext(BuyContext)

/**
 * Resolve a font's style groups into ResolvedFontGroup[] for projection
 * compilation. Uses the same slugify as the import utility for consistency.
 */
function resolveFontGroups(font: Font): ResolvedFontGroup[] {
  if (font.styleGroups?.length) {
    return font.styleGroups.map((sg) => {
      const groupName = sg.groupName || 'Standard'
      const groupSlug = slugify(groupName, { lower: true })
      const variantIds = [
        ...(sg.variants || []).map((v) => v._id),
        ...(sg.italicVariants || []).map((v) => v._id),
      ].filter(Boolean)
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
    selectedSkuOptions,
    licenseSize,
    toggleStyle: orderToggleStyle,
    toggleGroup: orderToggleGroup,
    selections,
    registerGroupResolutions,
  } = useOrderContext()

  // Resolve and register group resolutions when the font loads
  useEffect(() => {
    if (!font?._id || !font?.uid) return
    const groups = resolveFontGroups(font)
    if (groups.length > 0) {
      registerGroupResolutions(font.uid, groups)
    }
  }, [font?._id, font?.uid, registerGroupResolutions])

  const selectedSkus = selections[font.uid] ?? {}

  /** Build the StyleEntry metadata shared by both toggle helpers */
  const buildStyleEntry = (params: ToggleStyleParams): StyleEntry => ({
    licenseTypes: selectedSkuOptions.map((o) => o.reference) || [],
    parentName: font.shortName ?? font.name,
    className: params.className ?? '',
    name: params.name,
    defaultVariantId: font.defaultVariant?._id ?? '',
  })

  /** Toggle a single style in/out of the selection buffer */
  const toggleStyle = (params: ToggleStyleParams) => {
    orderToggleStyle({
      parentUid: font.uid!,
      skuCode: params.skuCode,
      styleMetadata: buildStyleEntry(params),
    })
  }

  /** Toggle an entire group (font family or subfamily) */
  const toggleGroup = (styles: ToggleStyleParams[]) => {
    if (styles.length === 0) return
    orderToggleGroup({
      parentUid: font.uid!,
      styles: styles.map((s) => ({
        skuCode: s.skuCode,
        styleMetadata: buildStyleEntry(s),
      })),
    })
  }

  /** Derived price/count summary computed from the selection buffer */
  const summary = useMemo<FontSelectionSummary>(() => {
    const styleCount = Object.keys(selectedSkus).length

    if (!licenseSize?.modifier || !selectedSkuOptions?.length || styleCount === 0) {
      // Still compute unitPrice/nextUnitPrice even with 0 selections
      // so the UI can show "what it would cost" for the first add
      const baseUnit = (licenseSize?.modifier && selectedSkuOptions?.length)
        ? calculateLineItemPrice({
            skuOptions: selectedSkuOptions,
            sizeModifier: licenseSize.modifier,
            count: 1,
          })
        : 0

      return {
        show: false,
        fontStyleCount: 0,
        unitPrice: formatPrice(baseUnit),
        nextUnitPrice: formatPrice(baseUnit),
        subtotal: 0,
        percentageDiscount: 0,
        totalDiscount: 0,
        total: 0,
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

    const discount = calculateDiscount(styleCount)

    return {
      show: true,
      fontStyleCount: styleCount,
      unitPrice: formatPrice(unitPriceCents),
      nextUnitPrice: formatPrice(nextUnitPriceCents),
      subtotal: formatPrice(subtotalCents),
      percentageDiscount: discount,
      totalDiscount: formatPrice(subtotalCents - totalCents),
      total: formatPrice(totalCents),
    }
  }, [selectedSkus, selectedSkuOptions, licenseSize])

  /** Base unit price (count=1, no volume discount) — stable regardless of selection count */
  const baseUnitPrice = useMemo(() => {
    if (!licenseSize?.modifier || !selectedSkuOptions?.length) return 0
    return formatPrice(
      calculateLineItemPrice({
        skuOptions: selectedSkuOptions,
        sizeModifier: licenseSize.modifier,
        count: 1,
      })
    )
  }, [selectedSkuOptions, licenseSize])

  /** Pre-computed "full family" group summary */
  const fullFamilySummary = useMemo<GroupPriceSummary>(() => {
    const styleCount = font.variants?.length || 0
    const percentageDiscount = styleCount ? calculateDiscount(styleCount) : 0
    const allSelected =
      styleCount > 0 && Object.keys(selectedSkus).length === styleCount
    const fullPrice = baseUnitPrice * styleCount
    const totalPrice = Math.round(fullPrice - fullPrice * percentageDiscount)
    return { styleCount, allSelected, percentageDiscount, fullPrice, totalPrice }
  }, [font.variants, selectedSkus, baseUnitPrice])

  /** Pre-computed group summaries keyed by groupName */
  const groupSummaries = useMemo<{ [groupName: string]: GroupPriceSummary }>(
    () => {
      if (!font.styleGroups) return {}
      const result: { [groupName: string]: GroupPriceSummary } = {}
      for (const group of font.styleGroups) {
        const styleCount =
          (group.variants?.length || 0) + (group.italicVariants?.length || 0)
        const percentageDiscount = styleCount
          ? calculateDiscount(styleCount)
          : 0
        const allVariantIds = [
          ...(group.variants || []).map((v) => v._id),
          ...(group.italicVariants || []).map((v) => v._id),
        ]
        const allSelected =
          styleCount > 0 && allVariantIds.every((id) => id in selectedSkus)
        const fullPrice = baseUnitPrice * styleCount
        const totalPrice = Math.round(
          fullPrice - fullPrice * percentageDiscount
        )
        result[group.groupName] = {
          styleCount,
          allSelected,
          percentageDiscount,
          fullPrice,
          totalPrice,
        }
      }
      return result
    },
    [font.styleGroups, selectedSkus, baseUnitPrice]
  )

  return (
    <BuyContext.Provider
      value={{
        ...state,
        font,
        selectedSkus,
        summary,
        toggleStyle,
        toggleGroup,
        fullFamilySummary,
        groupSummaries,
      }}
    >
      {children}
    </BuyContext.Provider>
  )
}
