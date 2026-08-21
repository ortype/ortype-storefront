/*
// Define types for our data structure
interface Variant {
  _id: string
  optionName: string
  shortName?: string // Added shortName field
}

interface Group {
  _type: string
  groupName: string
  variants: Variant[] | null
  italicVariants: Variant[] | null
}

interface Font {
  _id: string
  _type: string
  name: string
  shortName: string
  version?: string
  modifiedAt?: string
  slug?: string
  styleGroups?: Group[]
  defaultVariant?: Variant
  isVisible?: boolean
  uid?: string
}

*/

import type { HomeFont, HomeFontVariant, HomeStyleGroup } from '@/types'

export type HomeFontVariantWithShortName = HomeFontVariant & {
  shortName: string
}

type HomeStyleGroupWithShortNames = Omit<
  HomeStyleGroup,
  'variants' | 'italicVariants'
> & {
  variants: HomeFontVariantWithShortName[]
  italicVariants: HomeFontVariantWithShortName[]
}

export type HomeFontWithShortNames = Omit<HomeFont, 'styleGroups'> & {
  styleGroups: HomeStyleGroupWithShortNames[]
}

/**
 * Processes the variants data and adds a shortName field to each variant
 * by removing the groupName from the optionName.
 *
 * `toHomeFont()` (src/sanity/lib/normalize.ts) already guarantees
 * `styleGroups`/`variants`/`italicVariants` are plain, null-free arrays, so
 * this only needs to map over them - no null-branching required.
 *
 * @param fonts - The array of font objects containing styleGroups and variants
 * @returns The processed array with shortName fields added to all variants
 */
export default function addShortNameToVariants(
  fonts: HomeFont[],
): HomeFontWithShortNames[] {
  return fonts.map((font) => {
    const addShortName = (
      variant: HomeFontVariant,
      groupName: string | null,
    ): HomeFontVariantWithShortName => ({
      ...variant,
      shortName: removeGroupNameFromOption(variant.optionName, groupName),
    })

    const styleGroups = font.styleGroups.map((group) => ({
      ...group,
      variants: group.variants.map((variant) =>
        addShortName(variant, group.groupName),
      ),
      italicVariants: group.italicVariants.map((variant) =>
        addShortName(variant, group.groupName),
      ),
    }))

    return { ...font, styleGroups }
  })
}

/**
 * Helper function to remove the groupName from the optionName
 *
 * @param optionName - The original option name (may be null - the query
 * result honestly reflects that the referenced variant could be missing it)
 * @param groupName - The group name to remove
 * @returns The processed option name with the group name removed
 */
function removeGroupNameFromOption(
  optionName: string | null,
  groupName: string | null,
): string {
  if (!optionName) return ''
  if (!groupName) return optionName

  // Remove the group name and trim any extra spaces
  // This handles cases like "Condensed Thin" or "Mono Bold Italic"
  return optionName
    .replace(new RegExp(`^${groupName}\\s+`), '') // Remove from start
    .replace(new RegExp(`\\s+${groupName}\\s+`), ' ') // Remove from middle
    .replace(new RegExp(`\\s+${groupName}$`), '') // Remove from end
}

// Example usage:
// const processedFonts = addShortNameToVariants(originalFonts);
// console.log(JSON.stringify(processedFonts, null, 2));

/**
 * Helper function to process a single font object
 * Useful when working with a single font rather than an array
 *
 * @param font - The font object to process
 * @returns The processed font with shortName fields added to all variants
 */
export function addShortNameToSingleFont(
  font: HomeFont,
): HomeFontWithShortNames {
  return addShortNameToVariants([font])[0]
}
