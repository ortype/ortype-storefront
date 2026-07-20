'use client'
import {
  calculateDiscount,
  calculateLineItemPrice,
  formatPrice,
} from '@/commercelayer/utils/prices'
import type { CartLabels, MediaType } from '@/sanity/lib/queries'
import type { Order, SkuOption } from '@commercelayer/sdk'
import { createContext, FC, useContext, useMemo } from 'react'

import { useOrderContext } from '@/commercelayer/providers/Order'
import type {
  GroupResolutions,
  LicenseSize,
  SelectionBuffer,
  StyleEntry,
} from '@/commercelayer/providers/Order/types'
import type { CartBufferGroup, CartBufferItem, CartSubFamilyGroup } from './types'

export type { CartBufferGroup, CartBufferItem, CartSubFamilyGroup } from './types'

export interface CartProviderData {
  isLoading: boolean
  orderId?: string
  order?: Order
  /** Computed, sorted, grouped representation of the selection buffer */
  groupedLineItems: CartBufferGroup[]
  // License form — forwarded for CartComponent
  isLicenseForClient: boolean
  licenseSize?: LicenseSize
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  cartLabels?: CartLabels
  // Forwarded for CartItem / CartGroups
  skuOptions: SkuOption[]
  mediaTypes: MediaType[]
  selections: SelectionBuffer
  groupResolutions: GroupResolutions
  toggleStyle: (params: {
    parentUid: string
    skuCode: string
    styleMetadata: StyleEntry
  }) => void
  toggleGroup: (params: {
    parentUid: string
    styles: { skuCode: string; styleMetadata: StyleEntry }[]
  }) => void
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => void
}

interface CartProviderProps {
  children: React.ReactNode
}

export const CartContext = createContext<CartProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as CartProviderData
)

export const useCartContext = (): CartProviderData => useContext(CartContext)

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const {
    isLoading,
    orderId,
    order,
    isLicenseForClient,
    licenseSize,
    setLicenseSize,
    cartLabels,
    selections,
    groupResolutions,
    skuOptions,
    mediaTypes,
    toggleStyle,
    toggleGroup,
    setStyleLicenseTypes,
  } = useOrderContext()

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
      const allOrderedCodes = resolvedGroups.flatMap((rg) => rg.includedSkuCodes)
      const skuOrder = new Map(allOrderedCodes.map((id, i) => [id, i]))
      const sortedSkuCodes = [...skuCodes].sort(
        (a, b) => (skuOrder.get(a) ?? Infinity) - (skuOrder.get(b) ?? Infinity)
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
          for (const code of rg.includedSkuCodes) fullySelectedGroupCodes.add(code)
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
      const hasSubGroups = subGroupsRaw.length > 1

      return {
        parentUid,
        parentName: first?.parentName ?? '',
        defaultVariantId: first?.defaultVariantId ?? '',
        items,
        subGroups: hasSubGroups ? subGroupsRaw : [],
        hasSubGroups,
        allSelected,
        fullUnitPriceTotal: formatPrice(fullTotalCents),
        percentageDiscount: count ? calculateDiscount(count) : 0,
        discountedPriceTotal: formatPrice(discountedTotalCents),
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
        isLicenseForClient,
        licenseSize,
        setLicenseSize,
        cartLabels,
        skuOptions,
        mediaTypes,
        selections,
        groupResolutions,
        toggleStyle,
        toggleGroup,
        setStyleLicenseTypes,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
