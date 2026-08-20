'use client'
import { Tester } from '@/components/composite/Tester'
import { getTesterSizes } from '@/components/composite/Tester/tester-sizing'
import type { Font } from '@/sanity/lib/queries'
import { resolveHref } from '@/sanity/lib/utils'
import { Box, Flex, SegmentGroup, Wrap, WrapItem } from '@chakra-ui/react'
import Link from 'next/link'
import { useState } from 'react'

export interface FontIndexProps {
  fonts: Font[]
}

export default function FontIndex({ fonts }: FontIndexProps) {
  const [value, setValue] = useState('List')
  const table = value === 'Table'

  return (
    <>
      <Wrap pb={10} px={10} align={'center'} justifyContent={'center'} gap={2}>
        {fonts.map((font, key) => {
          const href = resolveHref(font._type, font.slug)
          if (!href) {
            return null
          }

          // Filter out null variants
          const validVariants = font.variants.filter(
            (variant): variant is NonNullable<typeof variant> =>
              variant !== null,
          )

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
                styleGroups={
                  font.styleGroups
                    ? font.styleGroups
                    : [{ groupName: 'standard', variants: validVariants }]
                }
                defaultVariantId={
                  font.defaultVariant?._id ||
                  (validVariants[0] && validVariants[0]._id)
                }
                index={key + 1} // Start tabIndex from 1 for sequential tab navigation
                title={font.shortName}
                slug={font.slug}
                href={href}
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
