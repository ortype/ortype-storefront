import { apiVersion, dataset, projectId, useCdn } from 'lib/sanity.api'
import {
  type Post,
  type Settings,
  type Font,
  type FontVariant,
  fontsQuery,
  fontAndMoreFontsQuery,
  fontVariantsQuery,
  indexQuery,
  postAndMoreStoriesQuery,
  postBySlugQuery,
  postSlugsQuery,
  fontSlugsQuery,
  settingsQuery,
} from 'lib/sanity.queries'
import { createClient } from 'next-sanity'

/**
 * Checks if it's safe to create a client instance, as `@sanity/client` will throw an error if `projectId` is false
 */
const client = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn })
  : null

export const apiClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn,
    })
  : null

export async function getSettings(): Promise<Settings> {
  if (client) {
    return (await client.fetch(settingsQuery)) || {}
  }
  return {}
}

export async function getAllPosts(): Promise<Post[]> {
  if (client) {
    return (await client.fetch(indexQuery)) || []
  }
  return []
}

export async function getAllPostsSlugs(): Promise<Pick<Post, 'slug'>[]> {
  if (client) {
    const slugs = (await client.fetch<string[]>(postSlugsQuery)) || []
    return slugs.map((slug) => ({ slug }))
  }
  return []
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (client) {
    return (await client.fetch(postBySlugQuery, { slug })) || ({} as any)
  }
  return {} as any
}

export async function getPostAndMoreStories(
  slug: string,
  token?: string | null
): Promise<{ post: Post; morePosts: Post[] }> {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn,
      token: token || undefined,
    })
    return await client.fetch(postAndMoreStoriesQuery, { slug })
  }
  return { post: null, morePosts: [] }
}

export async function findByUid(uid: string): Promise<{ font: Font }> {
  if (client) {
    return (
      (await client.fetch('*[_type == $type && uid == $uid][0]', {
        type: 'font',
        uid,
      })) || ({} as any)
    )
  }
  return {} as any
}

export async function findByParentUid(
  parentUid: string
): Promise<{ fontVariant: FontVariant }> {
  if (client) {
    return (
      (await client.fetch('*[_type == $type && parentUid == $parentUid]', {
        type: 'fontVariant',
        parentUid,
      })) || ({} as any)
    )
  }
  return {} as any
}

export async function findVariantByUid(
  uid: string
): Promise<{ fontVariant: FontVariant }> {
  if (client) {
    return (
      (await client.fetch('*[_type == $type && uid == $uid][0]', {
        type: 'fontVariant',
        uid,
      })) || ({} as any)
    )
  }
  return {} as any
}

export async function findByUidAndVersion(
  uid: string,
  version: string
): Promise<{ font: Font }> {
  if (client) {
    return (
      (await client.fetch(
        '*[_type == $type && uid == $uid && version == $version][0]',
        {
          type: 'font',
          uid,
          version,
        }
      )) || ({} as any)
    )
  }
  return {} as any
}

export async function getAllFonts(): Promise<Font[]> {
  if (client) {
    return (await client.fetch(fontsQuery)) || []
  }
  return []
}

export async function getAllFontsSlugs(): Promise<Pick<Font, 'slug'>[]> {
  if (client) {
    const slugs = (await client.fetch<string[]>(fontSlugsQuery)) || []
    return slugs.map((slug) => ({ slug }))
  }
  return []
}

export async function getAllFontVariants(): Promise<FontVariant[]> {
  if (client) {
    return (await client.fetch(fontVariantsQuery)) || []
  }
  return []
}

export async function getFontAndMoreFonts(
  slug: string,
  token?: string | null
): Promise<{ font: Font; moreFonts: Font[] }> {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn,
      token: token || undefined,
    })
    return await client.fetch(fontAndMoreFontsQuery, { slug })
  }
  return { font: null, moreFonts: [] }
}
