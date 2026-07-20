import type { StyleEntry } from '@/commercelayer/providers/Order/types'

/** A single cart item derived from the selection buffer */
export interface CartBufferItem {
  skuCode: string
  parentUid: string
  entry: StyleEntry
  /** Number of styles in the same parentUid group — used for volume-price calculation */
  groupCount: number
  /** True when this style belongs to a fully-selected resolved group (locks individual removal) */
  isInFullGroup: boolean
}

/** A sub-family group of items within a CartBufferGroup */
export interface CartSubFamilyGroup {
  groupName: string
  items: CartBufferItem[]
  /** True when every variant in this sub-group is present in the selection buffer */
  allSelected: boolean
}

/** A group of cart items sharing the same parentUid */
export interface CartBufferGroup {
  parentUid: string
  parentName: string
  defaultVariantId: string
  items: CartBufferItem[]
  /** Populated only when the font has 2+ sub-family groups with selected items */
  subGroups: CartSubFamilyGroup[]
  hasSubGroups: boolean
  /** True when all of the font's variants are present in the selection buffer */
  allSelected: boolean
  discountedPriceTotal: number
  fullUnitPriceTotal: number
  percentageDiscount: number
}
