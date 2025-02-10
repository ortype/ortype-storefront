import { defineQuery, PortableTextBlock } from 'next-sanity'

const postFields = defineQuery(`
  _id,
  title,
  date,
  excerpt,
  coverImage,
  "slug": slug.current,
  "author": author->{name, picture},
`)

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const postsQuery = defineQuery(`
*[_type == "post"] | order(date desc, _updatedAt desc) {
  ${postFields}
}`)

export const postAndMoreStoriesQuery = defineQuery(`{
  "post": *[_type == "post" && slug.current == $slug] | order(_updatedAt desc) [0] {
    content,
    ${postFields}
  },
  "morePosts": *[_type == "post" && slug.current != $slug] | order(date desc, _updatedAt desc) [0...2] {
    content,
    ${postFields}
  }
}`)

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
}

export interface Settings {
  title?: string
  description?: any[]
  ogImage?: {
    title?: string
  }
}

const fontFields = defineQuery(`
  _id,
  _type,
  name,
  shortName,
  isVisible,
  "slug": slug.current,
  variants[]->{name, optionName, _id},
  uid,
  version,
  metafields[]{key, value},
  defaultVariant->{_id, optionName},
  modules[]{
    ..., 
    book->{variantId, snapshots},
    tester->{defaultVariant->{_id, optionName}, defaultText},
    body[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          "slug": @.reference->slug
        }
      }
    } 
  },
  modifiedAt,
  languages[]{html, name},
  styleGroups[]{
    _type,
    groupName,
    variants[]->{_id, optionName},
    italicVariants[]->{_id, optionName}
  },
`)

const fontVariantFields = defineQuery(`
  _id,
  _type,
  name,
  optionName,
  "slug": slug.current,
  uid,
  parentUid,
  version,
  metafields[]{key, value}
`)

export const fontSlugsQuery = defineQuery(`
*[_type == "font" && defined(slug.current)][].slug.current
`)

interface Snapshot {
  createdAt: string
  spread: string
}

interface Book {
  variantId: string
  snapshots: Snapshot[]
}

interface SpecialFeature {
  title: string
  example: string
  tag: string
}

interface Module {
  title: string
  // different modules defined here
  // book
  book: Book
  config: {
    display: string
  }
  // features
  label: string
  features: SpecialFeature[]
  // content
  body: PortableTextBlock[]
  // info
  items: {
    key: string
    // content: @TODO sanity block types
    content: PortableTextBlock[]
  }
}

export interface Metafield {
  key: string
  value: string
}

export interface Feature {
  tag: string // 'aalt'
  name: string // 'Access All Alternates'
  css: { feature: string } // { feature: 'font-feature-settings: "aalt"', variant: null }
}

export interface Language {
  html: string // country code
  name: string // full name
  ot: string // another country code...
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

type StyleGroup = {
  groupName: string
  variants: { _id: string; optionName: string }[]
  italicVariants: { _id: string; optionName: string }[]
}

export interface Font {
  _id: string
  _type: string
  name: string
  isVisible: boolean
  uid?: string
  version?: string
  shortName?: string
  slug: string
  variants: FontVariant[]
  modules?: Module[]
  modifiedAt: string
  metafields: Metafield[]
  styleGroups?: StyleGroup[]
  metrics?: Metrics
  features?: Feature[]
  languages?: Language[]
  defaultVariant: FontVariant
}

export interface FontVariant {
  _id: string
  _type: string
  name: string
  optionName: string
  uid?: string
  parentUid?: string
  version?: string
}

// @TODO: unify `homePageQuery` with `visibleFontsQuery`
export const homePageQuery = defineQuery(`
{
  "fonts": *[_type == "font" && isVisible == true] {
    ${fontFields}
  }
}
`)

export const visibleFontsQuery = defineQuery(`
*[_type == "font" && isVisible == true] {
  ${fontFields}
}`)

// used in `getAllFonts` @TODO: consider removing if not really needed
export const fontsQuery = defineQuery(`
*[_type == "font"] {
  ${fontFields}
}`)

export const fontVariantsQuery = defineQuery(`
*[_type == "fontVariant"] {
  ${fontVariantFields}
}`)

export const fontAndMoreFontsQuery = defineQuery(`{
  "font": *[_type == "font" && slug.current == $slug && isVisible == true] | order(_updatedAt desc) [0] {
    ${fontFields}
  },
  "moreFonts": *[_type == "font" && slug.current != $slug && isVisible == true] | order(date desc, _updatedAt desc) [0...2] {
    ${fontFields}
  }
}`)
