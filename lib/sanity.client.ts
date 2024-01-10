import { createClient } from '@sanity/client/stega'
import {
  apiVersion,
  dataset,
  projectId,
  revalidateSecret,
  studioUrl,
} from 'lib/sanity.api'
import {
  fontAndMoreFontsQuery,
  fontIdsQuery,
  fontSlugsQuery,
  fontsQuery,
  fontVariantsQuery,
  indexQuery,
  postAndMoreStoriesQuery,
  settingsQuery,
  type Font,
  type FontVariant,
  type Post,
  type Settings,
} from 'lib/sanity.queries'
import { maybeInitiateOrType } from 'lib/utils/helpers'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // If webhook revalidation is setup we want the freshest content, if not then it's best to use the speedy CDN
  useCdn: revalidateSecret ? false : true,
  perspective: 'published',
  stega: {
    studioUrl,
    // logger: console,
    filter: (props) => {
      if (props.sourcePath.at(-1) === 'title') {
        return true
      }

      return props.filterDefault(props)
    },
  },
})

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

export async function findByUidAndVersionWithVariants(
  uid: string,
  version: string
): Promise<{ font: Font }> {
  if (client) {
    return (
      (await client.fetch(
        `*[_type == $type && uid == $uid && version == $version][0]{
          ...,
          variants[]-> {...}
        }`,
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

export async function findFontVariantByUidAndVersion(
  uid: string,
  version: string
): Promise<{ fontVariant: FontVariant }> {
  if (client) {
    return (
      (await client.fetch(
        '*[_type == $type && uid == $uid && version == $version][0]',
        {
          type: 'fontVariant',
          uid,
          version,
        }
      )) || ({} as any)
    )
  }
  return {} as any
}

export async function findFontVariantById(
  id: string
): Promise<{ fontVariant: FontVariant }> {
  if (client) {
    return (
      (await client.fetch('*[_type == $type && _id == $id][0]', {
        type: 'fontVariant',
        id,
      })) || ({} as any)
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

export async function getAllFontIds(): Promise<Pick<Font, '_id'>[]> {
  if (client) {
    const ids = (await client.fetch<string[]>(fontIdsQuery)) || []
    return ids.map((_id) => ({ _id }))
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
      useCdn: revalidateSecret ? false : true,
      token: token || undefined,
    })
    return await client.fetch(fontAndMoreFontsQuery, { slug })
  }
  return { font: null, moreFonts: [] }
}

/**
 * Fetches data from Sanity CMS and processes the results as necessary.
 *
 * @param {string} query - Sanity query.
 * @param {Object} [params={}] - Query parameters.
 * @returns {Promise<Array|Object|Boolean>} - Processed results.
 */
export async function getFontOrVariantWithOrTypeInstance(
  query: string,
  params: object = {}
): Promise<Array<any> | object | boolean> {
  try {
    const results = await apiClient.fetch(query, params)

    // Handle the possibility of an error result from Sanity
    if (results.error) {
      console.error('Error in sanity fetch response:', results.error)
      return results // Return the original results on error
    }

    return await maybeInitiateOrType(results)
  } catch (error) {
    console.error('Error in sanity api call:', error)
    // It might be safer to return false as an error indicator,
    // as we don't have the original results at this point.
    return false
  }
}
