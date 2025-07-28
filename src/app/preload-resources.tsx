'use client'

import { client } from '@/sanity/lib/client'
import { useEffect } from 'react'
import ReactDOM from 'react-dom'

import { visibleFontsQuery } from '@/sanity/lib/queries'

export function PreloadResources() {
  useEffect(() => {
    const preloadFonts = async () => {
      try {
        const fonts = await client.fetch<string[]>(visibleFontsQuery)
        fonts?.forEach((font) => {
          let familyFile = font?.metafields.find(
            (metafield) => metafield.key === 'familyFile'
          )?.value

          if (familyFile?.includes('public')) {
            familyFile = familyFile.replace(
              'public',
              process.env.NEXT_PUBLIC_API_URL || ''
            )
          }

          const type = familyFile?.includes('.ttf')
            ? 'font/truetype-variations'
            : 'font/woff2'
          ReactDOM.preload(familyFile, {
            as: 'font',
            type,
            crossOrigin: 'anonymous',
          })
        })
      } catch (error) {
        console.error('Failed to preload fonts:', error)
      }
    }

    preloadFonts()
  }, []) // Empty dependency array means this runs once on mount

  return null
}
