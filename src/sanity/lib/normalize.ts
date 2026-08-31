// src/sanity/lib/normalize.ts
import type { Font, HomeFont } from '@/types'
import type {
  FontQueryResult,
  HomePageQueryResult,
  LicenseMetricsQueryResult,
} from 'sanity.types'
import { LicenseMetrics } from './queries'

export function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

// For convenience in array filters
export function compactArray<T>(arr: (T | null)[] | null | undefined): T[] {
  return (arr ?? []).filter(nonNullable)
}

// Alternative using isDefined (also perfectly fine)
export function isDefined<T>(value: T | null | undefined): value is T {
  return value != null
}

export function compactArrayAlt<T>(
  arr: (T | null)[] | null | undefined
): T[] {
  return (arr ?? []).filter(isDefined)
}

type RawFont = NonNullable<FontQueryResult['font']>

/*
This gives you most of the benefit without writing bespoke transforms 
for every shape. The ...raw spread preserves all scalar fields with 
their original nullability, and you only override the array fields 
that need narrowing.
*/
export function toFont(raw: RawFont | null): Font | null {
  if (raw == null) return null

  return {
    ...raw,
    variants: compactArray(raw.variants).filter(nonNullable),
    metafields: compactArray(raw.metafields).filter(nonNullable),
    languages: compactArray(raw.languages).filter(nonNullable),
    styleGroups: compactArray(raw.styleGroups).map((group) => ({
      ...group,
      variants: compactArray(group.variants).filter(nonNullable),
      italicVariants: compactArray(group.italicVariants).filter(nonNullable),
    })),
  }
}

type RawHomeFont = NonNullable<HomePageQueryResult['fonts']>[number]

// Normalizer for `homePageQuery` / `visibleFontsQuery`'s shared shape. Callers
// should run `stegaClean()` on the raw fetch result first if stega encoding
// is enabled for that fetch (see src/app/(frontend)/[locale]/page.tsx) -
// this only compacts null items out of dereferenced arrays, it doesn't touch
// stega branding.
export function toHomeFont(raw: RawHomeFont): HomeFont {
  return {
    ...raw,
    // @TODO: declare slug as nonnullable
    variants: compactArray(raw.variants),
    styleGroups: compactArray(raw.styleGroups).map((group) => ({
      ...group,
      variants: compactArray(group.variants),
      italicVariants: compactArray(group.italicVariants),
    })),
  }
}

export function toHomeFonts(
  raw: RawHomeFont[] | null | undefined
): HomeFont[] {
  return (raw ?? []).map(toHomeFont)
}

/**
 * Normalization seam: map the (nullable) generated `licenseMetricsQuery`
 * result into the non-null domain types. Schema validation already requires
 * these fields, so incomplete entries are dropped rather than threaded as
 * nulls through the provider and consumers.
 * @TODO: can we make this helper more readable??
 */
export function normalizeLicenseMetrics(
  data: LicenseMetricsQueryResult
): LicenseMetrics {
  const sizes = (data?.sizes ?? []).flatMap((s) =>
    s.value != null && s.label != null && s.modifier != null
      ? [
          {
            value: s.value,
            label: s.label,
            modifier: s.modifier,
          },
        ]
      : []
  )
  const media = (data?.media ?? []).flatMap((m) =>
    m.value != null && m.label != null
      ? [{ _key: m._key, value: m.value, label: m.label }]
      : []
  )
  return { sizes, media }
}
