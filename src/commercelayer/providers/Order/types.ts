import {
  type CommerceLayerClient,
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

export type StyleEntry = {
  licenseTypes: string[]
  parentName: string
  name: string
  className: string
  defaultVariantId: string
}

export type SelectionBuffer = {
  [parentUid: string]: {
    [skuCode: string]: StyleEntry
  }
}

/** Derived price/count summary for a single font's selections */
export type FontSelectionSummary = {
  /** Whether to show the summary panel (has at least one selected style) */
  show: boolean
  /** Number of selected styles for this font */
  fontStyleCount: number
  /** Unit price at current selection count */
  unitPrice: number
  /** Unit price if one more style were added */
  nextUnitPrice: number
  /** Full price before discount (all styles priced at count=1) */
  subtotal: number
  /** Discount percentage (0–1) at current count */
  percentageDiscount: number
  /** Total discount amount in display units (EUR, not cents) */
  totalDiscount: number
  /** Final total after discount in display units */
  total: number
}

/** Pre-computed price summary for a font group (full family or subfamily) */
export type GroupPriceSummary = {
  styleCount: number
  allSelected: boolean
  percentageDiscount: number
  fullPrice: number
  totalPrice: number
}
/** Tracks a single committed parentUid group on the CL order */
export type CommittedGroup = {
  /** Hash of the group's buffer state at commit time */
  hash: string
  /** CL line item IDs belonging to this group */
  lineItemIds: string[]
}

/** Per-parentUid committed state, mirrors the SelectionBuffer shape */
export type CommittedGroups = {
  [parentUid: string]: CommittedGroup
}

export interface UpdateLineItemLicenseTypes {
  cl: CommerceLayerClient
  lineItem: LineItem
  selectedSkuOptions: SkuOption[]
}

export interface UpdateLineItemsLicenseSize {
  cl: CommerceLayerClient
  order: Order
  licenseSize: LicenseSize
}
