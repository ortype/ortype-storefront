import type { PortableTextBlock } from '@portabletext/types'
// import type { Image } from 'sanity'
import { Font, FontVariant } from '@/sanity/lib/queries'

export interface FontPagePayload {
  font: Font
  moreFonts: Font[]
}

export interface HomePagePayload {
  // footer?: PortableTextBlock[]
  // overview?: PortableTextBlock[]
  fonts?: Font[]
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
  shortName?: string
  uid?: string
  parentUid?: string
  version?: string
}
