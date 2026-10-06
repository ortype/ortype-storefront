/**
 * Derive the cart's view of the world from the Commerce Layer order.
 *
 * The order's line items are the single source of truth for what is in the
 * cart. These pure helpers turn them back into the shapes the UI works with:
 *
 *  - `deriveSelectionsFromOrder`      -> SelectionBuffer (per font, per style)
 *  - `deriveCommittedGroups`          -> per-font signature / line item ids / size
 *  - `deriveGroupResolutionsFromOrder`-> ResolvedFontGroup[] recovered from
 *                                        group projection line items
 *
 * Line items are created by `commitGroup` as either
 *  - a *group projection* (one line item standing in for N styles, metadata:
 *    `includedSkuCodes`, `includedStyleNames`, `license.perStyleTypes`, ...), or
 *  - a *style projection* (one line item per style, metadata: `styleName`,
 *    `license.types`, ...).
 */
import { withGroup } from './selection-utils'
import type {
  CommittedGroups,
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
  StyleEntry,
  StyleGroup,
} from '../types'

/** The line item metadata `commitGroup` writes (all fields optional) */
export interface ProjectionMetadata {
  projectionType?: string
  parentUid?: string
  parentName?: string
  defaultVariantId?: string
  /** Style projections: the style's display name */
  styleName?: string
  /** Group projections */
  groupName?: string
  groupSlug?: string
  includedSkuCodes?: string[]
  includedStyleNames?: string[]
  license?: {
    size?: LicenseSize
    /** Style projections */
    types?: string[]
    /** Group projections */
    defaultTypes?: string[]
    perStyleTypes?: Record<string, string[]>
  }
}

/** Minimal line item shape this module reads (a CL `LineItem` satisfies it) */
export interface DerivableLineItem {
  id: string
  name?: string | null
  sku_code?: string | null
  item_type?: string | null
  reference_origin?: string | null
  item?: { reference_origin?: string | null } | null
  metadata?: ProjectionMetadata | null
}

export interface DerivableOrder {
  line_items?: DerivableLineItem[] | null
}

/** Only skus/bundles are cart content (not shipments, payment methods, ...) */
export function shoppableLineItems(
  order: DerivableOrder | undefined | null
): DerivableLineItem[] {
  return (order?.line_items ?? []).filter(
    (li) => li.item_type === 'skus' || li.item_type === 'bundles'
  )
}

function parentUidOf(li: DerivableLineItem): string | undefined {
  return (
    li.metadata?.parentUid ||
    li.reference_origin ||
    li.item?.reference_origin ||
    undefined
  )
}

/** Ids of every cart line item that belongs to one font */
export function lineItemIdsForFont(
  order: DerivableOrder | undefined | null,
  parentUid: string
): string[] {
  return shoppableLineItems(order)
    .filter((li) => parentUidOf(li) === parentUid)
    .map((li) => li.id)
}

/** Ids of every cart (skus/bundles) line item on the order */
export function allCartLineItemIds(
  order: DerivableOrder | undefined | null
): string[] {
  return shoppableLineItems(order).map((li) => li.id)
}

/**
 * Stable signature of a font's selection: which styles, with which license
 * types. Display fields (names, parent info) are intentionally excluded so a
 * draft and a derived entry compare equal.
 */
export function groupSignature(group: StyleGroup): string {
  const entries = Object.keys(group)
    .sort()
    .map((skuCode) => [
      skuCode,
      [...(group[skuCode].licenseTypes ?? [])].sort(),
    ])
  return JSON.stringify(entries)
}

/** The styles on the order, grouped by font (parentUid) */
export function deriveSelectionsFromOrder(
  order: DerivableOrder | undefined | null
): SelectionBuffer {
  const selections: SelectionBuffer = {}

  for (const li of shoppableLineItems(order)) {
    const parentUid = parentUidOf(li)
    if (!parentUid) continue
    const meta = li.metadata ?? {}
    const group = (selections[parentUid] ??= {})

    if (meta.projectionType === 'group') {
      const skuCodes: string[] = meta.includedSkuCodes ?? []
      const styleNames: string[] = meta.includedStyleNames ?? []
      const perStyleTypes: Record<string, string[]> =
        meta.license?.perStyleTypes ?? {}
      const defaultTypes: string[] = meta.license?.defaultTypes ?? []

      skuCodes.forEach((skuCode, i) => {
        const entry: StyleEntry = {
          licenseTypes: perStyleTypes[skuCode] ?? defaultTypes,
          parentName: meta.parentName ?? '',
          name: styleNames[i] ?? skuCode,
          // The variant id doubles as the CSS class that loads the font
          className: skuCode,
          defaultVariantId: meta.defaultVariantId ?? '',
        }
        group[skuCode] = entry
      })
    } else if (li.sku_code) {
      group[li.sku_code] = {
        licenseTypes: meta.license?.types ?? [],
        parentName: meta.parentName ?? '',
        name: meta.styleName ?? li.name ?? li.sku_code,
        className: li.sku_code,
        defaultVariantId: meta.defaultVariantId ?? '',
      }
    }
  }

  // Drop fonts whose line items carried no styles
  for (const uid of Object.keys(selections)) {
    if (Object.keys(selections[uid]).length === 0) delete selections[uid]
  }
  return selections
}

/**
 * Per-font commit info: the signature of what is on the order, the line item
 * ids, and the license size the items were priced at. `size` is `undefined`
 * when the font's line items disagree (e.g. an interrupted reprice), which
 * counts as stale.
 */
export function deriveCommittedGroups(
  order: DerivableOrder | undefined | null,
  selections: SelectionBuffer = deriveSelectionsFromOrder(order)
): CommittedGroups {
  const committed: CommittedGroups = {}
  const sizes: Record<string, (LicenseSize | undefined)[]> = {}

  for (const li of shoppableLineItems(order)) {
    const parentUid = parentUidOf(li)
    if (!parentUid || !selections[parentUid]) continue
    const entry = (committed[parentUid] ??= {
      signature: groupSignature(selections[parentUid]),
      lineItemIds: [],
    })
    entry.lineItemIds.push(li.id)
    ;(sizes[parentUid] ??= []).push(li.metadata?.license?.size)
  }

  for (const [uid, list] of Object.entries(sizes)) {
    const first = list[0]
    const consistent = list.every(
      (s) => s?.value === first?.value && s?.modifier === first?.modifier
    )
    committed[uid].size = consistent ? first : undefined
  }
  return committed
}

/**
 * Recover resolved groups from group projection line items. Only groups that
 * are fully selected exist as line items, so this is a *fallback*: it is
 * merged beneath the cached / freshly registered resolutions.
 */
export function deriveGroupResolutionsFromOrder(
  order: DerivableOrder | undefined | null
): GroupResolutions {
  const resolutions: GroupResolutions = {}

  for (const li of shoppableLineItems(order)) {
    const meta = li.metadata ?? {}
    const parentUid = parentUidOf(li)
    if (meta.projectionType !== 'group' || !parentUid || !li.sku_code)
      continue
    const groups = (resolutions[parentUid] ??= [])
    if (groups.some((g) => g.groupSkuCode === li.sku_code)) continue
    const group: ResolvedFontGroup = {
      groupName: meta.groupName ?? '',
      groupSlug: meta.groupSlug ?? '',
      groupSkuCode: li.sku_code,
      includedSkuCodes: meta.includedSkuCodes ?? [],
    }
    groups.push(group)
  }
  return resolutions
}

/**
 * Merge resolutions: later sources win per font. Typically
 * `mergeGroupResolutions(derivedFromOrder, cachedOrRegistered)`.
 */
export function mergeGroupResolutions(
  ...sources: GroupResolutions[]
): GroupResolutions {
  const merged: GroupResolutions = {}
  for (const source of sources) {
    for (const [uid, groups] of Object.entries(source)) {
      if (groups.length > 0) merged[uid] = groups
    }
  }
  return merged
}

/**
 * Overlay optimistic, not-yet-written edits on top of the derived selections.
 * An empty group in the overlay means "pending removal".
 */
export function applySelectionOverlay(
  selections: SelectionBuffer,
  overlay: { [parentUid: string]: StyleGroup }
): SelectionBuffer {
  let result = selections
  for (const [uid, group] of Object.entries(overlay)) {
    result = withGroup(result, uid, group)
  }
  return result
}

/** Were this font's line items priced at a different size than `current`? */
export function isCommittedSizeStale(
  committedSize: LicenseSize | undefined,
  current: LicenseSize | undefined
): boolean {
  return (
    committedSize?.value !== current?.value ||
    committedSize?.modifier !== current?.modifier
  )
}
