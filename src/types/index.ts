export type * from 'sanity.types'

import {
  CreateDataAttribute,
  CreateDataAttributeProps,
  type StegaCleaned,
} from 'next-sanity'
import type {
  FontQueryResult,
  HomePageQueryResult,
  VisibleFontsQueryResult,
} from 'sanity.types'

// Every "array field → item type" alias:
// NonNullable<T> is applied to the checked type so the conditional is
// non-distributive: a naked `T` would distribute over `Array<X> | null`, and the
// `null` member matches with no inference candidate for `U`, widening the whole
// result to `unknown`.
export type ElementOf<T> =
  NonNullable<T> extends readonly (infer U)[] ? U : never

export type DataAttribute = CreateDataAttribute<
  CreateDataAttributeProps &
    Required<Pick<CreateDataAttributeProps, 'id' | 'type' | 'path'>>
>

// There's no `StegaEncodedValue` type. `next-sanity` re-exports
// `@sanity/client/stega`'s `StegaCleaned<T>`, which already deep-strips the
// `StegaString` brand recursively and has a matching runtime `stegaClean()`
// helper (also re-exported from `next-sanity`) - no need to hand-roll this.
export type WithoutStega<T> = StegaCleaned<T>

export interface FontPagePayload {
  font: Font
  moreFonts: Font[]
}

export interface HomePagePayload {
  // footer?: PortableTextBlock[]
  // overview?: PortableTextBlock[]
  fonts?: HomeFont[]
  // title?: string
}

export interface Author {
  name?: string
  picture?: any
}

export interface Post {
  _id: string
  title?: string
  coverImage?: any
  date?: string
  excerpt?: string
  author?: Author
  slug?: string
  content?: any
  name?: string
  // body?: PortableTextBlock[]
}

export interface PostPagePayload {
  post: Post
  morePosts: Post[]
}

export interface SettingsPayload {
  title?: string
  description?: any[]
  ogImage?: {
    title?: string
  }
}

// `Font` and friends mirror `fontQuery` (src/sanity/lib/queries.ts) exactly,
// derived from typegen's `FontQueryResult` instead of hand-declared, so they
// can't drift from what the query actually returns.
type RawFont = NonNullable<FontQueryResult['font']>
type RawStyleGroup = NonNullable<RawFont['styleGroups']>[number]
type RawStyleGroupVariant = NonNullable<RawStyleGroup['variants']>[number]

export type FontVariant = NonNullable<RawFont['variants']>[number]
export type Metafield = NonNullable<RawFont['metafields']>[number]
export type Language = NonNullable<RawFont['languages']>[number]

// `toFont()` (src/sanity/lib/normalize.ts) filters null items out of every
// dereferenced array below, so those fields are re-declared here as plain,
// item-safe arrays rather than typegen's `Array<T | null> | null`. Every
// other field keeps whatever nullability `FontQueryResult` actually reports.
export type StyleGroup = Omit<
  RawStyleGroup,
  'variants' | 'italicVariants'
> & {
  variants: RawStyleGroupVariant[]
  italicVariants: RawStyleGroupVariant[]
}

export interface Metrics {
  unitsPerEm: number
  contentArea: number
  lineGap: number
  capHeight: number
  ascent: number
  descent: number
  distanceTop: number
}

export type Font = Omit<
  RawFont,
  'variants' | 'metafields' | 'languages' | 'styleGroups'
> & {
  variants: FontVariant[]
  metafields: Metafield[]
  languages: Language[]
  styleGroups: StyleGroup[]
  // Computed client-side in FontPage from `metafields`; not part of the query.
  metrics?: Metrics
}

// `VisibleFont` and `HomeFont` mirror `visibleFontsQuery` and `homePageQuery`
// (src/sanity/lib/queries.ts), which share the trimmed `visibleFontFields`
// GROQ fragment. Because `HomeFont` only adds fields on top of that shared
// fragment, every `HomeFont` structurally satisfies `VisibleFont` too - so a
// `HomeFont[]` can be passed anywhere a `VisibleFont[]` is expected.
export type VisibleFont = VisibleFontsQueryResult[number]

type RawHomeFont = NonNullable<HomePageQueryResult['fonts']>[number]

export type HomeFontVariant = NonNullable<RawHomeFont['variants']>[number]

export type HomeStyleGroup = Omit<
  NonNullable<RawHomeFont['styleGroups']>[number],
  'variants' | 'italicVariants'
> & {
  variants: HomeFontVariant[]
  italicVariants: HomeFontVariant[]
}

export type HomeFont = Omit<RawHomeFont, 'variants' | 'styleGroups'> & {
  variants: HomeFontVariant[]
  styleGroups: HomeStyleGroup[]
}
