/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { apiVersion, dataset, projectId, studioUrl } from 'lib/sanity.api'
import { PluginOptions, defineConfig } from 'sanity'
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from 'sanity/presentation'
// import { resolveHref } from '@/sanity/lib/utils'
import { resolveHref } from '@/lib/sanity.utils'

import { visionTool } from '@sanity/vision'
// import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { pageStructure, singletonPlugin } from '@/sanity/plugins/settings'
import authorType from '@/sanity/schemas/author'
import { bookType, fontType, fontVariantType } from '@/sanity/schemas/font'
import body from '@/sanity/schemas/objects/body'
import moduleBook from '@/sanity/schemas/objects/modules/book'
import moduleContent from '@/sanity/schemas/objects/modules/content'
import moduleFeatures from '@/sanity/schemas/objects/modules/features'
import moduleInfo from '@/sanity/schemas/objects/modules/info'
import moduleStyles from '@/sanity/schemas/objects/modules/styles'
import moduleTester from '@/sanity/schemas/objects/modules/tester'
import postType from '@/sanity/schemas/post'
import productImageType from '@/sanity/schemas/productImage'
import settingsType from '@/sanity/schemas/settings'
import { media } from 'sanity-plugin-media'
import { structureTool } from 'sanity/structure'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Or Type – Sanity Studio'

const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,
  schema: {
    // If you want more content types, you can add them to this array
    types: [
      authorType,
      postType,
      fontType,
      fontVariantType,
      bookType,
      // productImageType,
      settingsType,
      // modules
      moduleBook,
      moduleFeatures,
      moduleInfo,
      moduleStyles,
      moduleTester,
      moduleContent,
      body,
    ],
  },
  plugins: [
    presentationTool({
      resolve: {
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
      },
      previewUrl: { previewMode: { enable: '/api/draft' } },
    }),
    structureTool({ structure: pageStructure([settingsType]) }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    // singletonPlugin([settingsType.name]),
    // vercelDeployTool(),
    media(),
    // Add an image asset source for Unsplash
    // unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    process.env.NODE_ENV === 'development' &&
      visionTool({ defaultApiVersion: apiVersion }),
  ].filter(Boolean) as PluginOptions[],
})
