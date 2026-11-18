import type { FontSection } from '@/components/pages/fonts/font-sections'
import { dataset, projectId, studioUrl } from '@/sanity/env'
import { Box } from '@chakra-ui/react'
import { createDataAttribute } from 'next-sanity'

export function sectionLinkEditAttribute(fontId: string, key: string) {
  return createDataAttribute({
    id: fontId,
    type: 'font',
    path: ['modules', { _key: key }, 'label'],
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).toString()
}

export default function SectionLink({
  section,
  fontId,
}: {
  section: FontSection
  fontId: string
}) {
  return (
    <Box
      data-sanity={sectionLinkEditAttribute(fontId, section.marker._key)}
      position='absolute'
      top={0}
      left={2}
      transform='translateY(-100%)'
      zIndex={1}
      bg='white'
      color='black'
      fontSize='xs'
      lineHeight='short'
      px={2}
      py={1}
      borderRadius='sm'
      boxShadow='sm'
    >
      Section: {section.marker.label}
    </Box>
  )
}
