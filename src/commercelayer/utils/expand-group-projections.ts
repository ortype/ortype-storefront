/**
 * Utilities for expanding group projection line items into per-style entries.
 *
 * Group projections compress N individual font styles into a single CL line
 * item. These utilities expand them back for display (order summary, account
 * orders) and downstream processing (fulfillment, license generation).
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Minimal line item shape consumed by the expansion utilities. */
export interface LineItemLike {
  id: string
  name?: string | null
  sku_code?: string | null
  item_type?: string | null
  item?: {
    name?: string | null
    reference_origin?: string | null
    [key: string]: any
  } | null
  line_item_options?: Array<{
    name?: string | null
    sku_option?: { id?: string; name?: string | null; metadata?: any } | null
    [key: string]: any
  }> | null
  unit_amount_float?: number | null
  metadata?: Record<string, any> | null
  [key: string]: any
}

/** A single expanded style entry derived from either a style or group line item. */
export interface ExpandedStyle {
  /** Stable key for React rendering (original id or synthetic) */
  id: string
  /** Style display name */
  name: string
  /** Style SKU code (variant _id) */
  skuCode: string
  /** Font family parentUid */
  parentUid: string
  /** Font family display name */
  parentName: string
  /** Default variant ID for font CSS class rendering */
  defaultVariantId: string
  /** Human-readable license type labels */
  licenseTypeLabels: string[]
  /** Raw license type references */
  licenseTypeRefs: string[]
  /** Per-style discounted price in cents, or null if unavailable */
  priceCents: number | null
  /** Per-style undiscounted price in cents (count=1), or null if unavailable */
  fullPriceCents: number | null
  /** Projection type that produced this entry */
  projectionType: 'group' | 'style' | 'unknown'
  /** Group name (only meaningful for entries from group projections) */
  groupName?: string
  /** The original CL line item this was expanded from */
  sourceLineItem: LineItemLike
}

/** A font family grouping of expanded styles. */
export interface ExpandedFontGroup {
  parentUid: string
  parentName: string
  defaultVariantId: string
  /** Total number of individual styles (group projections are expanded) */
  styleCount: number
  /** Sum of all style prices (float, e.g. 490.00) */
  groupTotal: number
  styles: ExpandedStyle[]
}

/* ------------------------------------------------------------------ */
/*  Core expansion                                                     */
/* ------------------------------------------------------------------ */

/**
 * Filter an order's line items to shoppable items (skus/bundles).
 */
export function filterShoppableItems(
  lineItems: LineItemLike[]
): LineItemLike[] {
  return lineItems.filter(
    (li) => li.item_type === 'skus' || li.item_type === 'bundles'
  )
}

/**
 * Expand a list of (already filtered) line items into per-style entries.
 *
 * - **Style projections** pass through as one entry per line item.
 * - **Group projections** are expanded into N entries using metadata:
 *   `includedSkuCodes`, `includedStyleNames`, `licenseTypeLabels`,
 *   `perStylePriceCents`, and `license.perStyleTypes`.
 * - Legacy line items without `projectionType` are treated as style projections.
 */
export function expandLineItems(
  lineItems: LineItemLike[]
): ExpandedStyle[] {
  const result: ExpandedStyle[] = []

  for (const item of lineItems) {
    const meta = item.metadata ?? {}
    const projectionType = meta.projectionType ?? 'unknown'

    if (projectionType === 'group') {
      const skuCodes: string[] = meta.includedSkuCodes ?? []
      const styleNames: string[] = meta.includedStyleNames ?? []
      const perStyleTypes: Record<string, string[]> =
        meta.license?.perStyleTypes ?? {}
      const labelMap: Record<string, string> =
        meta.licenseTypeLabels ?? {}
      const priceCentsMap: Record<string, number> =
        meta.perStylePriceCents ?? {}

      const fullPriceCentsMap: Record<string, number> =
        meta.perStyleFullPriceCents ?? {}

      for (let i = 0; i < skuCodes.length; i++) {
        const code = skuCodes[i]
        const typeRefs = perStyleTypes[code] ?? []

        result.push({
          id: `${item.id}-${i}`,
          name: styleNames[i] ?? code,
          skuCode: code,
          parentUid: meta.parentUid ?? '',
          parentName: meta.parentName ?? '',
          defaultVariantId: meta.defaultVariantId ?? '',
          licenseTypeLabels: typeRefs.map(
            (ref) => labelMap[ref] || ref
          ),
          licenseTypeRefs: typeRefs,
          priceCents: priceCentsMap[code] ?? null,
          fullPriceCents: fullPriceCentsMap[code] ?? null,
          projectionType: 'group',
          groupName: meta.groupName,
          sourceLineItem: item,
        })
      }
    } else {
      // Style projection or legacy line item
      const typeRefs: string[] = meta.license?.types ?? []
      const labelMap: Record<string, string> =
        meta.licenseTypeLabels ?? {}

      // Prefer metadata labels (metadata-only projections), fall back to
      // line_item_options names (legacy style projections)
      let labels: string[]
      if (Object.keys(labelMap).length > 0 && typeRefs.length > 0) {
        labels = typeRefs.map((ref) => labelMap[ref] || ref)
      } else {
        labels = (
          item.line_item_options
            ?.map((o) => o.sku_option?.name ?? o.name)
            .filter(Boolean) ?? []
        ) as string[]
      }

      // Prefer metadata priceCents (metadata-only), fall back to CL unit_amount_float
      const priceCents =
        meta.priceCents != null
          ? meta.priceCents
          : item.unit_amount_float != null
            ? Math.round(item.unit_amount_float * 100)
            : null

      // fullPriceCents: metadata (metadata-only) > same as priceCents (legacy fallback)
      const fullPriceCents =
        meta.fullPriceCents != null ? meta.fullPriceCents : priceCents

      result.push({
        id: item.id,
        name: item.name || item.item?.name || item.sku_code || '',
        skuCode: item.sku_code ?? '',
        parentUid:
          item.item?.reference_origin ?? meta.parentUid ?? '',
        parentName: meta.parentName ?? '',
        defaultVariantId: meta.defaultVariantId ?? '',
        licenseTypeLabels: labels,
        licenseTypeRefs: typeRefs,
        priceCents,
        fullPriceCents,
        projectionType: projectionType === 'style' ? 'style' : 'unknown',
        sourceLineItem: item,
      })
    }
  }

  return result
}

/* ------------------------------------------------------------------ */
/*  Grouping                                                           */
/* ------------------------------------------------------------------ */

/**
 * Group expanded styles by font family (parentUid).
 */
export function groupByFont(
  styles: ExpandedStyle[]
): ExpandedFontGroup[] {
  const map = new Map<string, ExpandedFontGroup>()

  for (const style of styles) {
    const uid = style.parentUid
    if (!uid) continue

    const existing = map.get(uid)
    if (existing) {
      existing.styles.push(style)
      existing.styleCount += 1
      if (style.priceCents != null) {
        existing.groupTotal += style.priceCents / 100
      }
    } else {
      map.set(uid, {
        parentUid: uid,
        parentName: style.parentName,
        defaultVariantId: style.defaultVariantId,
        styleCount: 1,
        groupTotal: style.priceCents != null ? style.priceCents / 100 : 0,
        styles: [style],
      })
    }
  }

  const groups = Array.from(map.values())
  for (const g of groups) {
    g.groupTotal = Math.round(g.groupTotal * 100) / 100
  }
  return groups
}

/* ------------------------------------------------------------------ */
/*  Totals                                                             */
/* ------------------------------------------------------------------ */

/** Computed order-level totals from expanded font groups. */
export interface OrderTotals {
  /** Sum of undiscounted per-style prices (float, e.g. 490.00) */
  subtotalAmount: number
  /** Sum of discounted per-style prices (float) */
  discountedTotal: number
  /** subtotalAmount - discountedTotal */
  totalDiscount: number
}

/**
 * Compute subtotal, discounted total, and discount from expanded groups.
 * Reusable across checkout order summary, account order pages, etc.
 */
export function computeOrderTotals(
  groups: ExpandedFontGroup[]
): OrderTotals {
  let subtotalCents = 0
  let discountedCents = 0

  for (const group of groups) {
    for (const style of group.styles) {
      subtotalCents += style.fullPriceCents ?? style.priceCents ?? 0
      discountedCents += style.priceCents ?? 0
    }
  }

  const subtotalAmount = Math.round(subtotalCents) / 100
  const discountedTotal = Math.round(discountedCents) / 100
  const totalDiscount =
    Math.round((subtotalAmount - discountedTotal) * 100) / 100

  return { subtotalAmount, discountedTotal, totalDiscount }
}

/* ------------------------------------------------------------------ */
/*  Convenience                                                        */
/* ------------------------------------------------------------------ */

/**
 * Full pipeline: filter → expand → group.
 * Takes raw order line items and returns font-grouped expanded styles.
 */
export function expandAndGroupLineItems(
  lineItems: LineItemLike[]
): ExpandedFontGroup[] {
  const shoppable = filterShoppableItems(lineItems)
  const expanded = expandLineItems(shoppable)
  return groupByFont(expanded)
}
