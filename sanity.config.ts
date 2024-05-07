/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { apiVersion, dataset, projectId, studioUrl } from 'lib/sanity.api'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'

import { visionTool } from '@sanity/vision'
// import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { locate } from '@/sanity/plugins/locate'
import { previewDocumentNode } from '@/sanity/plugins/previewPane'
import { productionUrl } from '@/sanity/plugins/productionUrl'
import { pageStructure, singletonPlugin } from '@/sanity/plugins/settings'
import authorType from '@/sanity/schemas/author'
import { fontType, fontVariantType } from '@/sanity/schemas/font'
import postType from '@/sanity/schemas/post'
import productImageType from '@/sanity/schemas/productImage'
import settingsType from '@/sanity/schemas/settings'
import { media } from 'sanity-plugin-media'
import { vercelDeployTool } from 'sanity-plugin-vercel-deploy'
import { deskTool } from 'sanity/desk'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Or Type – Sanity Studio'

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
      // productImageType,
      settingsType,
    ],
  },
  plugins: [
    deskTool({
      structure: pageStructure([settingsType]),
    }),
    presentationTool({
      locate,
      previewUrl: {
        draftMode: {
          enable: '/api/draft',
        },
      },
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([settingsType.name]),
    vercelDeployTool(),
    media(),
    // Add an image asset source for Unsplash
    // unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
