import { createClient } from 'next-sanity'

import {
  fontAndMoreFontsQuery,
  fontSlugsQuery,
  fontsQuery,
  fontVariantsQuery,
  visibleFontsQuery,
  type Font,
  type FontVariant,
  type Post,
  type Settings,
} from '@/sanity/lib/queries'

import { apiVersion, dataset, projectId, studioUrl } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: {
    studioUrl,
    // logger: console,
    filter: (props) => {
      if (props.sourcePath.at(-1) === 'title') {
        return true
      }

      // log props without too much noise from arrays
      if (
        props.sourcePath[0] !== 'metafields' &&
        props.sourcePath[0] !== 'optionName'
      ) {
        // console.log('filter stega: ', props)
      }

      // @NOTE: stega ignore book docs b/c snapshots.$.spread had non-white space characters
      // which broke JSON.parse
      if (props.sourceDocument._type === 'book') {
        return false
      }

      // remove all shortName paths from stega
      if (props.sourcePath.includes('shortName')) {
        return false
      }

      // remove all config paths from stega
      if (props.sourcePath.includes('config')) {
        return false
      }

      // @NOTE: stega ignore font menu href
      if (props.sourcePath[0] === 'fonts') {
        return false
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

export async function getVisibleFonts(): Promise<Font[]> {
  if (client) {
    return (await client.fetch(visibleFontsQuery)) || []
  }
  return []
}

export async function getAllFonts(): Promise<Font[]> {
  if (client) {
    return (await client.fetch(fontsQuery)) || []
  }
  return []
}

// @TODO: look at replacing with '@/sanity/loader/generateStaticSlugs'
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

// We use this on the font detail page
export async function getFontAndMoreFonts(
  slug: string,
  token?: string | null
): Promise<{ font: Font; moreFonts: Font[] }> {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: token || undefined,
    })
    return await client.fetch(fontAndMoreFontsQuery, { slug })
  }
  return { font: null, moreFonts: [] }
}
