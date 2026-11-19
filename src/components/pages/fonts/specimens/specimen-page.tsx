'use client'

import { BookPageContent } from '@/components/pages/book/RectoVerso'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { dataset, projectId, studioUrl } from '@/sanity/env'
import { Box, Flex } from '@chakra-ui/react'
import { createDataAttribute } from 'next-sanity'
import { memo } from 'react'
import type { SpecimenPage as Page } from './specimen-data'
import { BOOK_PAGE, PAGE_RATIO } from './specimen-sizing'

export function specimenEditAttribute(fontId: string, key?: string) {
  // These are new schema entries, not legacy modules; Studio must edit specimens.
  return createDataAttribute({
    id: fontId,
    type: 'font',
    path: key ? ['specimens', { _key: key }] : 'specimens',
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).toString()
}

export default memo(function SpecimenPage({
  page,
  width,
}: {
  page: Page
  width: number
}) {
  const font = useFont()
  // The same page renderer serves half a desktop spread and a full mobile slide.
  // Commit all text metrics and spacing at this scale to preserve authored fits.
  const conversion = width / BOOK_PAGE.width
  const padding = `${BOOK_PAGE.margin * conversion}px`

  return (
    <Box
      position='relative'
      bg='white'
      color='black'
      flexShrink={0}
      overflow='hidden'
      data-specimen-page={page.key}
      data-sanity={specimenEditAttribute(font!._id, page.key)}
      style={{ width, aspectRatio: PAGE_RATIO, transformOrigin: 'top left' }}
    >
      <Flex
        position='absolute'
        inset={0}
        alignContent='flex-start'
        flexWrap='wrap'
        style={{
          padding,
          fontSize: `${25 * conversion}px`,
          lineHeight: `${36 * conversion}px`,
        }}
      >
        <BookPageContent
          page={page.content}
          defaultVariantId={page.variantId || font?.defaultVariant?._id || ''}
          layout={{ padding, conversion, colWidth: BOOK_PAGE.columnWidth }}
          fluid
        />
      </Flex>
    </Box>
  )
})
