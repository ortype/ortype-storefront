import type { PortableTextBlock } from '@portabletext/types'
// import type { Image } from 'sanity'

export interface FontVariant {
  _id: string
  _type: string
  name?: string
  uid?: string
  parentUid?: string
  version?: string
}

export interface Font {
  _id: string
  _type: string
  name?: string
  uid?: string
  version?: string
  slug?: string
  variants?: FontVariant[]
}

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
