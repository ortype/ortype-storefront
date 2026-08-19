// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'
import { defineLive } from 'next-sanity/live'

const { sanityFetch: baseSanityFetch, SanityLive } = defineLive({
  client,
  browserToken: token,
  serverToken: token,
})

/**
 * Wrap `sanityFetch` so every query is also tagged with a shared `sanity`
 * cache tag, in addition to the automatic per-query sync tags next-sanity
 * applies (prefixed `sanity:` + an opaque, per-query value from the API).
 *
 * `/api/revalidate` calls `revalidateTag('sanity')` on every webhook
 * delivery. `revalidateTag` is an exact string match, and a generic webhook
 * payload has no way to reproduce next-sanity's opaque sync tags, so without
 * this shared tag that call silently matches nothing.
 */
export const sanityFetch: typeof baseSanityFetch = (options) =>
  baseSanityFetch({
    ...options,
    tags: ['sanity', ...(options?.tags ?? [])],
  })

export { SanityLive }
