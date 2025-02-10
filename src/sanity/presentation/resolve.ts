// src/sanity/presentation/resolve.ts

import {
  defineDocuments,
  defineLocations,
  PresentationPluginOptions,
  type DocumentLocation,
} from 'sanity/presentation'

import { resolveHref } from '@/sanity/lib/utils'

const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    {
      route: '/archive/:slug',
      filter: `_type == "post" && slug.current == $slug`,
    },
    {
      route: '/fonts/:slug',
      filter: `_type == "font" && slug.current == $slug`,
    },
  ]),
  locations: {
    // @TODO: review this functionality
    post: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: [
          homeLocation,
          {
            title: doc?.title || 'Untitled',
            href: resolveHref('post', doc?.slug)!,
          },
        ],
      }),
    }),
    font: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: [
          homeLocation,
          {
            title: doc?.title || 'Untitled',
            href: resolveHref('font', doc?.slug)!,
          },
        ],
      }),
    }),
  },
}
