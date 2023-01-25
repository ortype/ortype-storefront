import { apiVersion, dataset, projectId, useCdn } from 'lib/sanity.api'
import {
  type Font,
  type FontVariant,
  fontsQuery,
  fontVariantsQuery
} from 'lib/sanity.queries'
import { createClient } from 'next-sanity'

/**
 * Checks if it's safe to create a client instance, as `@sanity/client` will throw an error if `projectId` is false
 */
export const client = projectId
  ? createClient({ projectId, dataset, apiVersion, token: process.env.SANITY_API_WRITE_TOKEN, useCdn })
  : null

export async function findByUid(
  uid: string
): Promise<{ font: Font; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && uid == $uid][0]',{
      type: 'font',
      uid
    })) || ({} as any)
  }
  return {} as any
}

export async function findByParentUid(
  parentUid: string
): Promise<{ fontVariant: FontVariant; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && parentUid == $parentUid]',{
      type: 'fontVariant',
      parentUid
    })) || ({} as any)
  }
  return {} as any
}

export async function findVariantByUid(
  uid: string,
): Promise<{ fontVariant: FontVariant; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && uid == $uid][0]',{
      type: 'fontVariant',
      uid,
    })) || ({} as any)
  }
  return {} as any
}

export async function findByUidAndVersion(
  uid: string,
  version: string
): Promise<{ font: Font; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && uid == $uid && version == $version][0]',{
      type: 'font',
      uid,
      version
    })) || ({} as any)
  }
  return {} as any
}

export async function getAllFonts(): Promise<Font[]> {
  if (client) {
    return (await client.fetch(fontsQuery)) || []
  }
  return []
}

export async function getAllFontVariants(): Promise<FontVariant[]> {
  if (client) {
    return (await client.fetch(fontVariantsQuery)) || []
  }
  return []
}
