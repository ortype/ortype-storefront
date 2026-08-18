// src/sanity/presentation/resolve.ts

import {
  defineDocuments,
  defineLocations,
  PresentationPluginOptions,
  type DocumentLocation,
  type DocumentLocationsState,
} from 'sanity/presentation'

import { resolveHref } from '@/sanity/lib/utils'

const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

export const resolve: PresentationPluginOptions['resolve'] = {
  // Ordered most specific first; the `page` catch-all route (`/:slug`) would
  // otherwise swallow the `/archive/:slug` and `/fonts/:slug` routes.
  mainDocuments: defineDocuments([
    {
      route: '/archive/:slug',
      filter: `_type == "post" && slug.current == $slug`,
    },
    {
      route: '/fonts/:slug',
      filter: `_type == "font" && slug.current == $slug`,
    },
    {
      route: '/:slug',
      filter: `_type == "page" && slug.current == $slug`,
    },
  ]),
  locations: {
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
    page: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        locations: [
          homeLocation,
          {
            title: doc?.title || 'Untitled',
            href: resolveHref('page', doc?.slug)!,
          },
        ],
      }),
    }),
    // Singleton used across every page; not independently routable.
    settings: {
      message: 'This document is used on all pages',
      tone: 'caution',
    } satisfies DocumentLocationsState,
    // Referenced by posts for archive filtering; not independently routable.
    category: {
      message:
        'Categories are used to group and filter posts on the archive page',
      tone: 'caution',
    } satisfies DocumentLocationsState,
  },
}
