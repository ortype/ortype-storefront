'use client'
import { Tester } from '@/components/composite/Tester'
import type { Font } from '@/sanity/lib/queries'
import { resolveHref } from '@/sanity/lib/utils'
import { Box } from '@chakra-ui/react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'

export interface FontIndexProps {
  fonts: Font[]
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export default function FontIndex({
  fonts,
  encodeDataAttribute,
}: FontIndexProps) {
  return (
    <Box pb={10}>
      {fonts.map((font, key) => {
        const href = resolveHref(font._type, font.slug)
        const containsNull = font.variants.includes(null) // @TEMP: dealing broken data where variant refs come in as `null`
        if (containsNull) {
          console.log(
            'font contains broken variants!!',
            font.name,
            containsNull
          )
        }
        if (!href || containsNull) {
          return null
        }
        return (
          <Tester
            key={key}
            fontId={font._id}
            variants={font.variants}
            styleGroups={
              font.styleGroups
                ? font.styleGroups
                : [{ groupName: 'standard', variants: font.variants }]
            }
            defaultVariantId={
              font.defaultVariant?._id ||
              (font.variants[0] && font.variants[0]._id)
            }
            index={key}
            title={font.shortName}
            slug={font.slug}
            href={href}
            encodeDataAttribute={encodeDataAttribute}
          />
        )
      })}
    </Box>
  )
}
