import type { SkuOption } from '@commercelayer/sdk'
import type { SelectionBuffer, StyleEntry, StyleGroup } from '../types'

/** References of the given SkuOptions (skipping any without a reference) */
export function skuOptionRefs(options: SkuOption[]): string[] {
  return options.map((o) => o.reference).filter((ref): ref is string => !!ref)
}

/** The SkuOptions whose reference is in `refs`, preserving `options` order */
export function pickSkuOptions(
  options: SkuOption[],
  refs: string[]
): SkuOption[] {
  return options.filter((o) => !!o.reference && refs.includes(o.reference))
}

/** Count total styles across all parentUid groups */
export function countSelections(selections: SelectionBuffer): number {
  return Object.values(selections).reduce(
    (total, group) => total + Object.keys(group).length,
    0
  )
}

/**
 * Return a new buffer with `group` set for `parentUid`.
 * An empty group removes the parentUid entry entirely.
 */
export function withGroup(
  selections: SelectionBuffer,
  parentUid: string,
  group: StyleGroup
): SelectionBuffer {
  if (Object.keys(group).length === 0) {
    const { [parentUid]: _removed, ...rest } = selections
    return rest
  }
  return { ...selections, [parentUid]: group }
}

/** Add the style if absent, remove it if present */
export function toggleStyleInGroup(
  group: StyleGroup,
  skuCode: string,
  styleMetadata: StyleEntry
): StyleGroup {
  if (group[skuCode]) {
    const { [skuCode]: _removed, ...rest } = group
    return rest
  }
  return { ...group, [skuCode]: styleMetadata }
}

/**
 * If every given style is already selected, remove them; otherwise add them
 * all. Only touches the given styles, not the whole group (which may contain
 * other sub-groups).
 */
export function toggleStylesInGroup(
  group: StyleGroup,
  styles: { skuCode: string; styleMetadata: StyleEntry }[]
): StyleGroup {
  const allSelected = styles.every(({ skuCode }) => !!group[skuCode])

  if (allSelected) {
    const codesToRemove = new Set(styles.map((s) => s.skuCode))
    const remaining: StyleGroup = {}
    for (const [code, entry] of Object.entries(group)) {
      if (!codesToRemove.has(code)) {
        remaining[code] = entry
      }
    }
    return remaining
  }

  const updated: StyleGroup = { ...group }
  for (const { skuCode, styleMetadata } of styles) {
    updated[skuCode] = styleMetadata
  }
  return updated
}

/** Stamp the same licenseTypes onto every style in the group */
export function setGroupLicenseTypes(
  group: StyleGroup,
  licenseTypes: string[]
): StyleGroup {
  const updated: StyleGroup = {}
  for (const [code, entry] of Object.entries(group)) {
    updated[code] = { ...entry, licenseTypes }
  }
  return updated
}
