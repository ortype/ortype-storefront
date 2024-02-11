'use client'
import { Tester } from '@/components/composite/Tester'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import type { Font } from 'lib/sanity.queries'
import { resolveHref } from 'lib/sanity.utils' // from '@/sanity/lib/utils'

export interface FontIndexProps {
  fonts: Font[]
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export default function FontIndex({
  fonts,
  encodeDataAttribute,
}: FontIndexProps) {
  return (
    <section>
      <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
        Fonts
      </h2>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {fonts.map((font, key) => {
          const href = resolveHref(font._type, font.slug)
          const containsNull = font.variants.includes(null) // @TEMP: dealing broken data where variant refs come in as `null`
          console.log('font contains broken variants?', font.name, containsNull)
          if (!href || containsNull) {
            return null
          }
          return (
            <Tester
              key={key}
              fontId={font._id}
              variants={font.variants}
              defaultVariantId={font.variants[0] && font.variants[0]._id}
              index={key}
              title={font.name}
              slug={font.slug}
              href={href}
              encodeDataAttribute={encodeDataAttribute}
            />
          )
        })}
      </div>
    </section>
  )
}
