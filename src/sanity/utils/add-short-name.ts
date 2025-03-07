import type { Font } from '@/sanity/lib/queries'

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
/**
 * Processes the variants data and adds a shortName field to each variant
 * by removing the groupName from the optionName.
 *
 * @param fonts - The array of font objects containing styleGroups and variants
 * @returns The processed array with shortName fields added to all variants
 */
export default function addShortNameToVariants(fonts: Font[]): Font[] {
  return fonts.map((font) => {
    // If styleGroups is undefined, return the font as is
    if (!font.styleGroups) {
      return font
    }

    // Process all groups in the styleGroups array
    const processedStyleGroups = font.styleGroups.map((group) => {
      const { groupName } = group

      // Process normal variants
      const processedVariants = group.variants
        ? group.variants.map((variant) => {
            return {
              ...variant,
              shortName: removeGroupNameFromOption(
                variant.optionName,
                groupName
              ),
            }
          })
        : null

      // Process italic variants
      const processedItalicVariants = group.italicVariants
        ? group.italicVariants.map((variant) => {
            return {
              ...variant,
              shortName: removeGroupNameFromOption(
                variant.optionName,
                groupName
              ),
            }
          })
        : null

      return {
        ...group,
        variants: processedVariants,
        italicVariants: processedItalicVariants,
      }
    })

    // Return the font with processed styleGroups
    return {
      ...font,
      styleGroups: processedStyleGroups,
    }
  })
}

/**
 * Helper function to remove the groupName from the optionName
 *
 * @param optionName - The original option name
 * @param groupName - The group name to remove
 * @returns The processed option name with the group name removed
 */
function removeGroupNameFromOption(
  optionName: string,
  groupName: string
): string {
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
export function addShortNameToSingleFont(font: Font): Font {
  // If styleGroups is undefined, return the font as is
  if (!font.styleGroups) {
    return font
  }

  return addShortNameToVariants([font])[0]
}
