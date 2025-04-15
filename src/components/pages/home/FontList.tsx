'use client'
import { Tester } from '@/components/composite/Tester'
import type { Font } from '@/sanity/lib/queries'
import { resolveHref } from '@/sanity/lib/utils'
import { Box, Flex, SegmentGroup, Wrap, WrapItem } from '@chakra-ui/react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import Link from 'next/link'
import { useState } from 'react'

export interface FontIndexProps {
  fonts: Font[]
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export default function FontIndex({
  fonts,
  encodeDataAttribute,
}: FontIndexProps) {
  const [value, setValue] = useState('List')
  const table = value === 'Table'

  return (
    <>
      <Wrap pb={10} px={10} align={'center'} justifyContent={'center'} gap={2}>
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
            <WrapItem
              key={key}
              w={
                table
                  ? {
                      base: '100%',
                      sm: 'calc(50% - 0.5rem)',
                      lg: 'calc(33.33% - 0.5rem)',
                    }
                  : '100%'
              }
              fontSize={
                table
                  ? {
                      base: '2rem',
                      sm: '3rem',
                      '2xl': '3.25rem',
                      '3xl': '4rem',
                    }
                  : '8rem'
              }
              lineHeight={
                table
                  ? {
                      base: '3rem',
                      sm: '4rem',
                      '2xl': '4.25rem',
                      '3xl': '5rem',
                    }
                  : '10rem'
              }
              pt={table ? '4rem' : '2rem'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <Tester
                table={table}
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
                index={key + 1} // Start tabIndex from 1 for sequential tab navigation
                title={font.shortName}
                slug={font.slug}
                href={href}
                encodeDataAttribute={encodeDataAttribute}
              />
            </WrapItem>
          )
        })}
      </Wrap>
      <Box pos={'fixed'} bottom={4} right={4}>
        <SegmentGroup.Root
          value={value}
          size={'md'}
          onValueChange={(e) => setValue(e.value)}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={['List', 'Table']} />
        </SegmentGroup.Root>
      </Box>
    </>
  )
}
