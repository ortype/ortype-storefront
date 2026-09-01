'use client'
import { Tester } from '@/components/composite/Tester'
import {
  getTesterCssVars,
  TESTER_ITEM_CSS,
} from '@/components/composite/Tester/tester-sizing'
import { resolveHref } from '@/sanity/lib/utils'
import type { HomeFont } from '@/types'
import {
  Box,
  Tabs,
  Flex,
  SegmentGroup,
  Wrap,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export interface FontIndexProps {
  fonts: HomeFont[]
}

export default function FontIndex({ fonts }: FontIndexProps) {
  const [value, setValue] = useState('list')
  const table = value === 'table'

  // Derive per-font render data once from `fonts`. This does NOT depend
  // on `table`, so toggling table/list no longer re-runs `resolveHref`
  // and rebuilds `styleGroups`/`variants` arrays for every font on the
  // same frame the CSS transition starts - freeing up main-thread time
  // right when it matters most for a smooth animation.
  const items = useMemo(
    () =>
      fonts
        .map((font, key) => {
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

          return { key, font, href, validVariants, styleGroups }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [fonts]
  )

  return (
    <>
      <SimpleGrid
        pb={10}
        px={10}
        align={'center'}
        justifyContent={'center'}
        gap={2}
        columns={
          table
            ? {
                base: 1,
                sm: 2,
                lg: 3,
              }
            : 1
        }
        css={getTesterCssVars(table)}
      >
        {items.map(({ key, font, href, validVariants, styleGroups }) => (
          <GridItem
            key={key}
            css={TESTER_ITEM_CSS}
            contentVisibility={'auto'}
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
                font.defaultVariant?._id || validVariants[0]?._id || ''
              }
              index={key + 1} // Start tabIndex from 1 for sequential tab navigation
              title={font.shortName ?? ''}
              slug={font.slug ?? ''}
              badge={font.badge ?? {}}
              href={href}
            />
          </GridItem>
        ))}
      </SimpleGrid>
      <Box pos={'fixed'} bottom={4} right={4}>
        <Tabs.Root
          size={'sm'}
          value={value}
          defaultValue={'List'}
          variant={'enclosed'}
          onValueChange={(e) => setValue(e.value)}
        >
          <Tabs.List>
            <Tabs.Trigger value='list'>List</Tabs.Trigger>
            <Tabs.Trigger value='table'>Table</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.Root>

        {/*<SegmentGroup.Root
          value={value}
          size={'sm'}
          onValueChange={(e) => setValue(e.value)}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={['List', 'Table']} />
        </SegmentGroup.Root>*/}
      </Box>
    </>
  )
}
