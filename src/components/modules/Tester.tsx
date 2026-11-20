'use client'

import { useFont } from '@/components/pages/fonts/FontContainer'
import type {
  FontSection,
  TesterModuleValue,
} from '@/components/pages/fonts/font-sections'
import { useFontToolbarOwner } from '@/components/pages/fonts/font-toolbar-context'
import { dataset, projectId, studioUrl } from '@/sanity/env'
import { Box, Flex } from '@chakra-ui/react'
import { createDataAttribute } from 'next-sanity'
import { useRef, useState } from 'react'
import SectionLink from './section-link'
import TesterCanvas from './tester/tester-canvas'
import { getTesterLayout } from './tester/tester-layout'
import TesterStyleSelect from './tester/tester-style-select'
import TesterToolbar from './tester/tester-toolbar'
import { useTesterState } from './tester/use-tester-state'

type TesterModuleProps = {
  value: TesterModuleValue
  section?: FontSection
  isDraftMode?: boolean
}

export default function TesterModule(props: TesterModuleProps) {
  // A different document/module starts a fresh editing session; ordinary
  // preview updates and toolbar visibility changes do not remount the editor.
  const font = useFont()!
  return <TesterSession key={`${font._id}-${props.value._key}`} {...props} />
}

function TesterSession({
  value,
  section,
  isDraftMode = false,
}: TesterModuleProps) {
  const font = useFont()!
  const sectionRef = useRef<HTMLDivElement>(null)
  const ownsToolbar = useFontToolbarOwner(sectionRef)
  const [width, setWidth] = useState(0)
  const state = useTesterState(value, font)
  const layout = getTesterLayout(width, state.zoom)
  const label = value.title || 'Type Tester'
  const editAttribute = createDataAttribute({
    id: font._id,
    type: 'font',
    path: ['modules', { _key: value._key }],
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).toString()

  return (
    <Box
      ref={sectionRef}
      as='section'
      id={section?.id ?? `font-tester-${value._key}`}
      role='region'
      aria-label={section?.marker.label || label}
      tabIndex={-1}
      data-sanity={editAttribute}
      data-font-tester={value._key}
      width='100%'
      minW={0}
      px={{ base: 3, md: 5 }}
      my={{ base: 32, md: 48 }}
      position='relative'
      scrollMarginTop={{ base: '8rem', xl: '5rem' }}
      _focusVisible={{ outline: '2px solid white', outlineOffset: '-2px' }}
    >
      {section && isDraftMode && (
        <SectionLink section={section} fontId={font._id} />
      )}
      <Flex
        bg='white'
        color='black'
        direction='column'
        height={{
          base: 'clamp(260px, calc(100dvh - 16rem), 900px)',
          md: 'clamp(360px, calc(100dvh - 12rem), 1100px)',
        }}
        minW={0}
      >
        <Box px={4} pt={2} pb={1}>
          <TesterStyleSelect
            font={font}
            variantId={state.variantId}
            onChange={state.setVariant}
          />
        </Box>
        <TesterCanvas
          initialText={state.initialText}
          revision={state.revision}
          variantId={state.variantId}
          layout={layout}
          onWidthChange={setWidth}
        />
      </Flex>
      <TesterToolbar
        visible={ownsToolbar && width > 0}
        zoom={state.zoom}
        fontSize={layout.fontSize}
        enableLongParagraph={state.enableLongParagraph}
        onZoomChange={state.setZoom}
        onReset={state.reset}
        label={label}
      />
    </Box>
  )
}
