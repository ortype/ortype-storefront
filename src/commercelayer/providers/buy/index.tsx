import { ActionType, reducer } from '@/commercelayer/providers/buy/reducer'
import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import { Font } from '@/sanity/lib/queries'
import { createContext, FC, useContext, useMemo, useReducer } from 'react'
import type { FontSelectionSummary, StyleEntry } from '../Order/types'
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

export const BuyProvider: FC<BuyProviderProps> = ({ font, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const {
    selectedSkuOptions,
    licenseSize,
    toggleStyle: orderToggleStyle,
    toggleGroup: orderToggleGroup,
    selections,
  } = useOrderContext()

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

  return (
    <BuyContext.Provider
      value={{
        ...state,
        font,
        selectedSkus,
        summary,
        toggleStyle,
        toggleGroup,
      }}
    >
      {children}
    </BuyContext.Provider>
  )
}
