/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { visionTool } from '@sanity/vision'
import { PluginOptions, defineConfig } from 'sanity'
import { media } from 'sanity-plugin-media'
import { presentationTool, type DocumentLocation } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId, studioUrl } from './src/sanity/env'
import { resolve } from './src/sanity/presentation/resolve'
import authorType from './src/sanity/schemas/author'
import blockContent from './src/sanity/schemas/blockContent'
import categoryType from './src/sanity/schemas/categoryType'
import { bookType, fontType, fontVariantType } from './src/sanity/schemas/font'
import fontPageBody from './src/sanity/schemas/font/blocks/body'
import fontModuleBook from './src/sanity/schemas/font/modules/book'
import fontModuleContent from './src/sanity/schemas/font/modules/content'
import fontModuleFeatures from './src/sanity/schemas/font/modules/features'
import fontModuleInfo from './src/sanity/schemas/font/modules/info'
import fontModuleStyles from './src/sanity/schemas/font/modules/styles'
import fontModuleTester from './src/sanity/schemas/font/modules/tester'
import pageType from './src/sanity/schemas/page'
import postType from './src/sanity/schemas/post'
import settingsType from './src/sanity/schemas/settings'
import { structure } from './src/sanity/structure'

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
      pageType,
      categoryType,
      fontType,
      fontVariantType,
      bookType,
      // productImageType,
      settingsType,
      // modules
      fontModuleBook,
      fontModuleFeatures,
      fontModuleInfo,
      fontModuleStyles,
      fontModuleTester,
      fontModuleContent,
      fontPageBody,
      // info
      blockContent,
    ],
  },
  plugins: [
    presentationTool({
      resolve,
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
    }),
    structureTool({ structure }),
    media(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    process.env.NODE_ENV === 'development' &&
      visionTool({ defaultApiVersion: apiVersion }),
  ].filter(Boolean) as PluginOptions[],
})
