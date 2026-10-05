import slugify from 'slugify'
import type { ResolvedFontGroup } from '../Order/types'

type VariantRef = { _id: string } | null

/**
 * Minimal structural shape of a font needed to resolve its style groups.
 * Satisfied by both the buy page `Font` and the clone page's Sanity result.
 */
export interface FontGroupSource {
  _id: string
  variants?: VariantRef[] | null
  styleGroups?:
    | {
        groupName?: string | null
        variants?: VariantRef[] | null
        italicVariants?: VariantRef[] | null
      }[]
    | null
}

/**
 * Interleave variants and italicVariants in display order, matching the
 * mergeVariants logic used by Typefaces: Regular, Regular Italic, Medium, …
 * This order is stored in includedSkuCodes so the cart can sort by it.
 */
export function interleaveVariantIds(
  variants: VariantRef[],
  italicVariants: VariantRef[]
): string[] {
  const ids: string[] = []
  const maxLen = Math.max(variants.length, italicVariants.length)
  for (let i = 0; i < maxLen; i++) {
    const v = variants[i]
    const iv = italicVariants[i]
    if (i < variants.length && v?._id) ids.push(v._id)
    if (i < italicVariants.length && iv?._id) ids.push(iv._id)
  }
  return ids
}

/**
 * Resolve a font's style groups into ResolvedFontGroup[] for projection
 * compilation. Uses the same slugify as the import utility for consistency.
 * includedSkuCodes is stored in interleaved display order so both the buy
 * page and the cart can sort by index without extra data.
 */
export function resolveFontGroups(
  font: FontGroupSource
): ResolvedFontGroup[] {
  if (font.styleGroups?.length) {
    return font.styleGroups.map((sg) => {
      const groupName = sg.groupName || 'Standard'
      const groupSlug = slugify(groupName, { lower: true })
      const variantIds = interleaveVariantIds(
        sg.variants || [],
        sg.italicVariants || []
      )
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
    const variantIds = font.variants
      .map((v) => v?._id)
      .filter((id): id is string => !!id)
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
