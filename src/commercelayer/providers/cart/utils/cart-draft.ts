/**
 * Pure helpers for the cart page's draft (unsaved edits).
 *
 * The draft is a `SelectionBuffer`-shaped map `{ [parentUid]: StyleGroup }`
 * holding only the fonts the user has edited. An entry REPLACES that font's
 * styles from the order when the cart is displayed, and an EMPTY group means
 * "pending removal" (see `applySelectionOverlay`). The order stays the source
 * of truth: an entry equal to what is on the order is not an edit.
 */
import { groupSignature } from '../../order/utils/derive-selections'
import type { SelectionBuffer, StyleGroup } from '../../order/types'

const isEmptyGroup = (group: StyleGroup | undefined): boolean =>
  !group || Object.keys(group).length === 0

/** Does `draftGroup` differ from what the order holds for the font? */
export function isFontDirty(
  orderGroup: StyleGroup | undefined,
  draftGroup: StyleGroup
): boolean {
  if (isEmptyGroup(orderGroup)) return !isEmptyGroup(draftGroup)
  // Font is on the order: an empty draft is a pending removal
  if (isEmptyGroup(draftGroup)) return true
  return groupSignature(orderGroup!) !== groupSignature(draftGroup)
}

/**
 * Drop draft entries that match the order, so undoing every edit to a font
 * returns the cart to clean. Returns the same object when nothing changed.
 */
export function normalizeDraft(
  orderSelections: SelectionBuffer,
  draft: SelectionBuffer
): SelectionBuffer {
  let result = draft
  for (const uid of Object.keys(draft)) {
    if (!isFontDirty(orderSelections[uid], draft[uid])) {
      if (result === draft) result = { ...draft }
      delete result[uid]
    }
  }
  return result
}

/** The uids of fonts whose draft differs from the order */
export function dirtyFonts(
  orderSelections: SelectionBuffer,
  draft: SelectionBuffer
): string[] {
  return Object.keys(normalizeDraft(orderSelections, draft))
}

/** The group without the given styles (the input is not mutated) */
export function removeStylesFromGroup(
  group: StyleGroup,
  skuCodes: string[]
): StyleGroup {
  const remove = new Set(skuCodes)
  const next: StyleGroup = {}
  for (const [code, entry] of Object.entries(group)) {
    if (!remove.has(code)) next[code] = entry
  }
  return next
}

/** The entries of `group` for the given styles (those that are present) */
export function pickStyles(
  group: StyleGroup,
  skuCodes: string[]
): StyleGroup {
  const picked: StyleGroup = {}
  for (const code of skuCodes) {
    if (group[code]) picked[code] = group[code]
  }
  return picked
}

/**
 * Undo a removal: merge the removed entries back into the font's CURRENT
 * styles. Deliberately not a snapshot restore, so edits made to the font after
 * the removal are kept.
 */
export function restoreStyles(
  group: StyleGroup,
  removed: StyleGroup
): StyleGroup {
  return { ...group, ...removed }
}
