/**
 * Types shared across `providers/order` (and its consumers).
 *
 * Rule of thumb: a type lives next to the file that owns it, and is promoted
 * here only when 2+ files use it or it is part of the public API. File-local
 * types stay in their file (e.g. `Action` in `reducer.ts`, `MutationQueue` in
 * `utils/mutation-queue.ts`).
 */
import type { LicenseOwner } from '@/commercelayer/providers/checkout'
import type {
  BuyLabels,
  CartLabels,
  CompanySize,
  MediaType,
} from '@/sanity/lib/queries'
import type { Order, OrderUpdate, SkuOption } from '@commercelayer/sdk'

// --- License ---

/** The order-wide license size (a Sanity company size, copied onto the order) */
export type LicenseSize = CompanySize

export type LicenseOwnerInput = Pick<LicenseOwner, 'is_client' | 'company'>

// --- Cart selections ---

export type StyleEntry = {
  licenseTypes: string[]
  parentName: string
  name: string
  className: string
  defaultVariantId: string
}

/** The selected styles for a single font (parentUid), keyed by skuCode */
export type StyleGroup = { [skuCode: string]: StyleEntry }

export type SelectionBuffer = {
  [parentUid: string]: StyleGroup
}

/** Derived price/count summary for a single font's selections */
export type FontSelectionSummary = {
  /** Whether to show the summary panel (has at least one selected style) */
  show: boolean
  /** Number of selected styles for this font */
  fontStyleCount: number
  /** Unit price at current selection count, in cents */
  unitPriceCents: number
  /** Unit price if one more style were added, in cents */
  nextUnitPriceCents: number
  /** Per-style undiscounted price (count=1), in cents */
  fullPriceCents?: number
  /** Full price before discount (all styles priced at count=1), in cents */
  subtotalCents: number
  /** Discount percentage (0–1) at current count */
  percentageDiscount: number
  /** Total discount amount, in cents */
  totalDiscountCents: number
  /** Final total after discount, in cents */
  totalCents: number
}

/** Pre-computed price summary for a font group (full family or subfamily) */
export type GroupPriceSummary = {
  styleCount: number
  allSelected: boolean
  countSelected: number
  percentageDiscount: number
  fullPriceCents: number
  totalPriceCents: number
}

/**
 * A single parentUid group as it exists on the CL order. Derived from the
 * order's line items (see `utils/derive-selections.ts`), never stored.
 */
export type CommittedGroup = {
  /** Signature of the committed styles + license types (see `groupSignature`) */
  signature: string
  /** CL line item IDs belonging to this group */
  lineItemIds: string[]
  /**
   * The order-wide license size these line items were priced at. Used to detect
   * silent "size staleness" without marking the group dirty. `undefined` (the
   * line items disagree or carry no size) is treated as stale.
   */
  size?: LicenseSize
}

/** Per-parentUid committed state, mirrors the SelectionBuffer shape */
export type CommittedGroups = {
  [parentUid: string]: CommittedGroup
}

/** A resolved style group for hybrid projection compilation */
export type ResolvedFontGroup = {
  groupName: string
  groupSlug: string
  /** Deterministic CL group SKU code: ${font._id}--group--${groupSlug} */
  groupSkuCode: string
  /** Variant _id values included in this group (order-independent) */
  includedSkuCodes: string[]
}

/** Per-parentUid group resolutions, used by the projection compiler */
export type GroupResolutions = {
  [parentUid: string]: ResolvedFontGroup[]
}

// --- Provider ---

export interface CartWriteError {
  message: string
  originalError?: unknown
}

export interface UpdateOrderArgs {
  id: string
  attributes: Omit<OrderUpdate, 'id'>
  include?: string[]
}

/** The outcome of a cart / order write */
export type CartWriteResult = { success: boolean; error?: CartWriteError }

export interface CreateOrderResult {
  success: boolean
  error?: CartWriteError
  order?: Order
  orderId?: string
}

/** The OrderProvider reducer state */
export type OrderStateData = {
  order?: Order
  orderId?: string
  licenseOwner?: LicenseOwnerInput
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  /** Whether licenseSize is valid */
  hasValidLicenseSize: boolean
  /** Whether license type is valid */
  hasValidLicenseType: boolean
  /** Whether all license info is set */
  allLicenseInfoSet: boolean
  /** Whether the order has line items */
  hasLineItems: boolean
  licenseSize?: LicenseSize
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  isLoading: boolean
  isInvalid: boolean
  /** Resolutions registered by the buy page (cache); see `groupResolutions` for the effective set */
  groupResolutions: GroupResolutions
}

/** What `useOrderContext()` returns */
export type OrderProviderData = {
  order?: Order
  orderId?: string
  /** Number of styles in the cart (see `utils/selection-utils.ts#countSelections`) */
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  companySizes: CompanySize[]
  mediaTypes: MediaType[]
  buyLabels?: BuyLabels
  cartLabels?: CartLabels
  licenseSize?: LicenseSize
  createOrder: (params?: {
    customMetadata?: Record<string, any>
    customAttributes?: Record<string, any>
  }) => Promise<CreateOrderResult>
  refetchOrder: () => Promise<{
    success: boolean
    order?: Order
  }>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: CartWriteError
    order?: Order
  }>
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  licenseOwner?: LicenseOwnerInput
  hasValidLicenseSize: boolean
  hasValidLicenseType: boolean
  allLicenseInfoSet: boolean
  hasLineItems: boolean
  setLicenseOwner: (params: { licenseOwner?: LicenseOwnerInput }) => void
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  /**
   * The styles in the cart, per font. DERIVED from `order.line_items` (the
   * order is the source of truth). Cart-page edits are overlaid optimistically
   * by `CartProvider`, not here.
   */
  selections: SelectionBuffer
  /** Per-font signature / line item ids / priced size, derived from the order */
  committedGroups: CommittedGroups
  /** The order has line items, no write is pending, and no font is priced at a stale size */
  isFullyCommitted: boolean
  /** A cart write is queued or running */
  hasPendingWrites: boolean
  /** Some committed font was priced at a different license size than the current one */
  isSizeStale: boolean
  /**
   * Commit `group` (a font's draft selections) to CL line items. The refetched
   * order then drives `selections`; `options.licenseTypes` is promoted to the
   * order-wide default license types. Queued; latest commit per font wins.
   */
  commitGroup: (
    parentUid: string,
    group: StyleGroup,
    options?: { licenseTypes?: string[] }
  ) => Promise<CartWriteResult>
  /** Remove a font from the cart (deletes its committed line items). Queued like `commitGroup`. */
  removeGroup: (parentUid: string) => Promise<CartWriteResult>
  /**
   * Reprice every font whose line items were priced at a different license
   * size than the current one (a recommit per stale font).
   */
  repriceAll: () => Promise<CartWriteResult>
  /**
   * Resolve once the cart is settled: the debounced license metadata write has
   * been flushed and every queued cart write has finished.
   */
  flushPendingWrites: () => Promise<void>
  /** Delete every cart line item from the order (the order itself is kept) */
  clearCommittedItems: () => Promise<CartWriteResult>
  /**
   * Make sure a CL order exists (creating it with the current license buffer
   * if needed) and return it. `licenseTypes` overrides the default types
   * written to a newly created order.
   */
  ensureOrder: (
    licenseTypes?: string[]
  ) => Promise<{ orderId: string; order: Order }>
  /**
   * The latest provider state, read synchronously. Unlike render-time values
   * it already reflects dispatches made earlier in the same tick, which queued
   * writes (and code that composes them, e.g. cart clone) rely on.
   */
  getSnapshot: () => OrderStateData
  /** Resolved style groups per parentUid, for hybrid projection */
  groupResolutions: GroupResolutions
  /** Register resolved groups for a font (called by BuyProvider on mount) */
  registerGroupResolutions: (
    parentUid: string,
    groups: ResolvedFontGroup[]
  ) => void
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  setSelectedSkuOptions: (params: {
    /** Only used for logging */
    font?: { shortName?: string | null }
    selectedSkuOptions: SkuOption[]
  }) => void
}
