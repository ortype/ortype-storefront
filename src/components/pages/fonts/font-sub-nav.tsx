'use client'

import { sectionLinkEditAttribute } from '@/components/modules/section-link'
import type { Font } from '@/types'
import { Box, Button, ButtonGroup, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import type { RefObject } from 'react'
import type { FontSection } from './font-sections'
import { useFontSectionNavigation } from './use-font-section-navigation'

export default function FontSubNav({
  font,
  sections,
  contentRef,
}: {
  font: Font
  sections: FontSection[]
  contentRef: RefObject<HTMLDivElement | null>
}) {
  const { activeId, navigate } = useFontSectionNavigation(
    sections,
    contentRef
  )
  return (
    <Box
      as='nav'
      aria-label='Font sections'
      position='fixed'
      top={{ base: '2rem', xl: 4 }}
      left='50%'
      transform='translateX(-50%)'
      maxW={{ base: 'calc(100% - 2rem)', xl: 'calc(100% - 40rem)' }}
      width='max-content'
      zIndex='docked'
    >
      <ButtonGroup size='sm' gap={2} maxW='100%' my={2}>
        {sections.length > 0 && (
          <HStack gap={1} overflowX='auto' minW={0} py={1} px={1}>
            {sections.map((section) => (
              <Button
                key={section.id}
                asChild
                variant='outline'
                bg={
                  activeId === section.id
                    ? 'colorPalette.fg'
                    : 'colorPalette.bg'
                }
                color={
                  activeId === section.id
                    ? 'colorPalette.bg'
                    : 'colorPalette.fg'
                }
                borderRadius='full'
                size='xs'
                textStyle='sm'
                flexShrink={0}
                _hover={{ bg: 'colorPalette.fg', color: 'colorPalette.bg' }}
                _focusVisible={{ outline: '2px solid', outlineOffset: '2px' }}
              >
                <a
                  href={`#${section.id}`}
                  aria-current={
                    activeId === section.id ? 'location' : undefined
                  }
                  onClick={(event) => navigate(event, section.id)}
                  data-sanity={sectionLinkEditAttribute(
                    font._id,
                    section.marker._key
                  )}
                >
                  {section.marker.label}
                </a>
              </Button>
            ))}
          </HStack>
        )}
        <HStack gap={1} flexShrink={0}>
          <Button
            bg='#00835E'
            color='white'
            size='xs'
            textStyle='sm'
            borderRadius='full'
            _hover={{ bg: 'colorPalette.fg' }}
            asChild
          >
            <Link href={`/fonts/${font.slug}/buy`} scroll={false}>
              Buy
            </Link>
          </Button>
          <Button
            bg='red'
            color='white'
            size='xs'
            textStyle='sm'
            borderRadius='full'
            _hover={{ bg: 'colorPalette.fg' }}
            asChild
          >
            <Link href='#' scroll={false}>
              Trials
            </Link>
          </Button>
        </HStack>
      </ButtonGroup>
    </Box>
  )
}
