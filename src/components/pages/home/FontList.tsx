'use client'
import { Tester } from '@/components/composite/Tester'
import { getTesterSizes } from '@/components/composite/Tester/tester-sizing'
import { resolveHref } from '@/sanity/lib/utils'
import type { HomeFont } from '@/types'
import { Box, Flex, SegmentGroup, Wrap, WrapItem } from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'

export interface FontIndexProps {
  fonts: HomeFont[]
}

export default function FontIndex({ fonts }: FontIndexProps) {
  const [value, setValue] = useState('List')
  const table = value === 'Table'

  return (
    <>
      <Wrap pb={10} px={10} align={'center'} justifyContent={'center'} gap={2}>
        {fonts.map((font, key) => {
          const href = resolveHref(font._type, font.slug ?? undefined)
          if (!href) {
            return null
          }

          // `toHomeFont()` already guarantees `variants` is null-item-free.
          const validVariants = font.variants

          // `toHomeFont()` guarantees `styleGroups` is an array (never
          // null), so `font.styleGroups ? ... : ...` always took this
          // branch even for fonts with no real style groups - breaking the
          // selector for fonts that only define top-level `variants`.
          // Check length instead, and fall back to a synthetic group.
          const styleGroups =
            font.styleGroups.length > 0
              ? font.styleGroups.map((group) => ({
                  groupName: group.groupName ?? '',
                  variants: group.variants,
                  italicVariants: group.italicVariants,
                }))
              : [
                  {
                    groupName: 'standard',
                    variants: validVariants,
                    italicVariants: [],
                  },
                ]

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
              css={getTesterSizes(table)}
              flexDirection={'column'}
              alignItems={'center'}
              _hover={{
                '& .buy-button': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
            >
              <Tester
                table={table}
                fontId={font._id}
                variants={validVariants}
                styleGroups={styleGroups}
                defaultVariantId={
                  font.defaultVariant?._id ||
                  validVariants[0]?._id ||
                  ''
                }
                index={key + 1} // Start tabIndex from 1 for sequential tab navigation
                title={font.shortName ?? ''}
                slug={font.slug ?? ''}
                href={href}
              />
            </WrapItem>
          )
        })}
      </Wrap>
      <Box pos={'fixed'} bottom={4} right={4}>
        <SegmentGroup.Root
          value={value}
          size={'sm'}
          onValueChange={(e) => setValue(e.value)}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={['List', 'Table']} />
        </SegmentGroup.Root>
      </Box>
    </>
  )
}
