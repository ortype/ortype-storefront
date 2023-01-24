import { apiVersion, dataset, projectId, useCdn } from 'lib/sanity.api'
import {
  type Product,
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
): Promise<{ product: Product; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && uid == $uid][0]',{
      type: 'product',
      uid
    })) || ({} as any)
  }
  return {} as any
}

export async function findByUidAndVersion(
  uid: string,
  version: string
): Promise<{ product: Product; }> {
  if (client) {
    return (await client.fetch('*[_type == $type && uid == $uid && version == $version][0]',{
      type: 'product',
      uid,
      version
    })) || ({} as any)
  }
  return {} as any
}
