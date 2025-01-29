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
  locations: {
    // Add more locations for other post types
    post: defineLocations({
      select: {
        title: 'title',
        slug: 'slug.current',
      },
      resolve: (doc) => ({
        mainDocuments: defineDocuments([
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug`,
          },
          {
            route: '/fonts/:slug',
            filter: `_type == "font" && slug.current == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'caution',
          }),
          font: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('font', doc?.slug)!,
                },
                homeLocation,
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug)!,
                },
                homeLocation,
              ],
            }),
          }),
        },
      }),
    }),
  },
}
