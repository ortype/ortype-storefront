import { groq } from 'next-sanity'

const postFields = groq`
  _id,
  title,
  date,
  excerpt,
  coverImage,
  "slug": slug.current,
  "author": author->{name, picture},
`

export const settingsQuery = groq`*[_type == "settings"][0]`

export const indexQuery = groq`
*[_type == "post"] | order(date desc, _updatedAt desc) {
  ${postFields}
}`

export const postAndMoreStoriesQuery = groq`
{
  "post": *[_type == "post" && slug.current == $slug] | order(_updatedAt desc) [0] {
    content,
    ${postFields}
  },
  "morePosts": *[_type == "post" && slug.current != $slug] | order(date desc, _updatedAt desc) [0...2] {
    content,
    ${postFields}
  }
}`

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

const fontFields = groq`
  _id,
  _type,
  name,
  isVisible,
  "slug": slug.current,
  variants[]->{name, optionName, _id},
  uid,
  version,
  metafields[]{key, value},
  modules[]{_type, book->{variantId, snapshots}, config},
  modifiedAt
`

const fontVariantFields = groq`
  _id,
  _type,
  name,
  optionName,
  "slug": slug.current,
  uid,
  parentUid,
  version,
  metafields[]{key, value}
`

export const fontSlugsQuery = groq`
*[_type == "font" && defined(slug.current)][].slug.current
`

interface Snapshot {
  createdAt: string
  spread: string
}

interface Book {
  variantId: string
  snapshots: Snapshot[]
}

interface Module {
  book: Book
  // different modules defined here
  config: {
    display: string
  }
}

export interface Metafield {
  key: string
  value: string
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

export interface Font {
  _id: string
  _type: string
  name: string
  isVisible: boolean
  uid?: string
  version?: string
  slug: string
  variants: FontVariant[]
  modules?: Module[]
  modifiedAt: string
  metafields: Metafield[]
  metrics?: Metrics
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
export const homePageQuery = groq`
{
  "fonts": *[_type == "font" && isVisible == true] {
    ${fontFields}
  }
}
`

export const visibleFontsQuery = groq`
*[_type == "font" && isVisible == true] {
  ${fontFields}
}`

// used in `getAllFonts` @TODO: consider removing if not really needed
export const fontsQuery = groq`
*[_type == "font"] {
  ${fontFields}
}`

export const fontVariantsQuery = groq`
*[_type == "fontVariant"] {
  ${fontVariantFields}
}`

export const fontAndMoreFontsQuery = groq`
{
  "font": *[_type == "font" && slug.current == $slug && isVisible == true] | order(_updatedAt desc) [0] {
    ${fontFields}
  },
  "moreFonts": *[_type == "font" && slug.current != $slug && isVisible == true] | order(date desc, _updatedAt desc) [0...2] {
    ${fontFields}
  }
}`
