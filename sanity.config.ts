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
import { bookType, fontType, fontVariantType } from './src/sanity/schemas/font'
import body from './src/sanity/schemas/objects/body'
import moduleBook from './src/sanity/schemas/objects/modules/book'
import moduleContent from './src/sanity/schemas/objects/modules/content'
import moduleFeatures from './src/sanity/schemas/objects/modules/features'
import moduleInfo from './src/sanity/schemas/objects/modules/info'
import moduleStyles from './src/sanity/schemas/objects/modules/styles'
import moduleTester from './src/sanity/schemas/objects/modules/tester'
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
      resolve,
      previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } },
    }),
    structureTool({ structure }),
    // vercelDeployTool(),
    media(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    process.env.NODE_ENV === 'development' &&
      visionTool({ defaultApiVersion: apiVersion }),
  ].filter(Boolean) as PluginOptions[],
})
