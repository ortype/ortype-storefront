'use client'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { useDimensions } from '@/components/pages/fonts/contexts/dimensionsContext'
import { useSpreadState } from '@/components/pages/fonts/contexts/spreadStateContext'
import type {
  FontSection,
  FontModule,
} from '@/components/pages/fonts/font-sections'
import { dataset, projectId, studioUrl } from '@/sanity/env'
import { Box, Flex } from '@chakra-ui/react'
import {
  PortableText,
  type PortableTextTypeComponentProps,
} from '@portabletext/react'
import {
  createDataAttribute,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import React, { useMemo } from 'react'
import BookModule from './Book'
import ContentModule from './Content'
import FeaturesModule from './Features'
import InfoModule from './Info'
import StylesModule from './Styles'
import TesterModule from './Tester'
import SectionLink from './section-link'

// Type definitions for better TypeScript support
interface PageDividerProps {
  visible: boolean
  overflowCol: boolean
  isOverflowing: boolean
}

const PageDivider: React.FC<PageDividerProps> = ({
  visible,
  overflowCol,
  isOverflowing,
}) => {
  const isSpread = isOverflowing && overflowCol

  return (
    <Box
      className={'page-divider'}
      css={{
        position: 'absolute',
        width: '2px',
        background: '#C6C6C6',
        height: '100%',
        pointerEvents: 'none',
        top: 0,
      }}
      zIndex={'base'}
      style={{
        display: visible ? 'block' : 'none',
        right: !isSpread && 0,
        left: isSpread && '50%',
      }}
    />
  )
}

// Type definitions for better TypeScript support
interface DoublePageProps {
  children: React.ReactNode
  value: any
  font: any
  spreadMode?: boolean
  overflowCol: boolean
  section?: FontSection
  isDraftMode?: boolean
  textAlign?: string
  [key: string]: any // For additional props
}

const DoublePage: React.FC<DoublePageProps> = ({
  children,
  value,
  font,
  spreadMode = false,
  overflowCol,
  section,
  isDraftMode,
  ...props
}) => {
  const { _key } = value
  const { spreadAspect, conversion, pageAspect, marginBottom, padding } =
    useDimensions()
  const { state } = useSpreadState()

  // Memoize values from context to prevent unnecessary calculations
  const isOverflowing = useMemo(
    () => state.items[_key]?.isOverflowing,
    [state.items, _key]
  )

  const itemState = useMemo(() => state.items[_key], [state.items, _key])

  const isSpread = spreadMode || (isOverflowing && overflowCol)
  // Memoize Sanity data attribute creation
  const attr = useMemo(
    () =>
      createDataAttribute({
        id: font?._id,
        type: 'font',
        path: 'modules',
        projectId,
        dataset,
        baseUrl: studioUrl,
      }),
    [font?._id]
  )

  return (
    <Box
      className={'spread-page'}
      flex={{
        base: '0 0 100%',
        lg: isSpread ? '0 0 100%' : '0 0 50%',
      }} // responsive values
      data-sanity={attr([{ _key }]).toString()}
      id={section?.id}
      role={section ? 'region' : undefined}
      tabIndex={section ? -1 : undefined}
      aria-label={section?.marker.label}
      scrollMarginTop={{ base: '8rem', xl: '5rem' }}
      _focusVisible={{ outline: '2px solid', outlineOffset: '2px' }}
      mb={marginBottom}
      position='relative'
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        // @TODO: no aspect for < lg breakpoint? only if it is not the book which
        // always has an aspect?
        // paddingBottom: isSpread ? spreadAspect : pageAspect,
        paddingBottom: {
          base: 0,
          lg: isSpread ? spreadAspect : pageAspect,
        },
      }}
      css={{
        p: {
          // @NOTE: either manual enter line-breaks `/n` with shift+return
          // in the editor or we define a maxW only when centered
          // maxW: props.textAlign === 'center' ? '85%' : '100%',
          // mx: 'auto',
        },
      }}
      {...props}
    >
      {section && isDraftMode && (
        <SectionLink section={section} fontId={font._id} />
      )}
      <Flex
        // @TODO: how to best make the w, h, top, left, bottom, right, etc. media query conditional
        w={{ base: 'auto', lg: '100%' }}
        h={{ base: 'auto', lg: '100%' }}
        bg={'#FFF'}
        position={{ base: 'relative', lg: 'absolute' }}
        top={{ base: 'auto', lg: 0 }}
        left={{ base: 'auto', lg: 0 }}
        bottom={{ base: 'auto', lg: 0 }}
        right={{ base: 'auto', lg: 0 }}
        wrap={'nowrap'}
        direction={'column'}
        alignContent={'flex-start'}
        style={{
          padding,
          fontSize: 25 * conversion + 'px',
          lineHeight: 36 * conversion + 'px',
        }}
        overflow={'hidden'}
        className={`page-content-${itemState?.index}`}
      >
        {children}
      </Flex>
      <PageDivider
        visible={itemState?.index % 2 == 0}
        overflowCol={overflowCol}
        isOverflowing={isOverflowing}
      />
    </Box>
  )
}

// Type definitions for better TypeScript support
interface SinglePageProps {
  children: React.ReactNode
  _key?: string
  font: any
  value: any
  section?: FontSection
  isDraftMode?: boolean
  [key: string]: any // For additional props
}

const SinglePage: React.FC<SinglePageProps> = ({
  children,
  _key,
  font,
  value,
  section,
  isDraftMode,
  ...props
}) => {
  // Use _key from value if not directly provided
  const itemKey = useMemo(() => _key || value?._key, [_key, value?._key])
  const { pageAspect, padding, conversion, marginBottom } = useDimensions()
  const { state } = useSpreadState()

  // Memoize state item to prevent unnecessary rerenders
  const itemState = useMemo(
    () => state.items[itemKey],
    [state.items, itemKey]
  )

  // Memoize Sanity data attribute creation
  const attr = useMemo(
    () =>
      createDataAttribute({
        id: font?._id,
        type: 'font',
        path: 'modules',
        projectId,
        dataset,
        baseUrl: studioUrl,
      }),
    [font?._id]
  )

  return (
    <Box
      className={'single-page'}
      data-sanity={attr([{ _key: itemKey }]).toString()}
      id={section?.id}
      role={section ? 'region' : undefined}
      tabIndex={section ? -1 : undefined}
      aria-label={section?.marker.label}
      scrollMarginTop={{ base: '8rem', xl: '5rem' }}
      _focusVisible={{ outline: '2px solid', outlineOffset: '2px' }}
      flex={{ base: '0 0 100%', lg: '0 0 50%' }} // responsive values
      mb={marginBottom}
      position='relative'
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        paddingBottom: pageAspect,
      }}
      css={{
        p: {
          // @NOTE: either manual enter line-breaks `/n` with shift+return
          // in the editor or we define a maxW only when centered
          // maxW: props.textAlign === 'center' ? '85%' : '100%',
          // mx: 'auto',
        },
      }}
      {...props}
    >
      {section && isDraftMode && (
        <SectionLink section={section} fontId={font._id} />
      )}
      <Flex
        className={`page-${itemState?.index}`}
        w={'100%'}
        h={'100%'}
        bg={'#FFF'}
        position={'absolute'}
        top={0}
        left={0}
        bottom={0}
        right={0}
        wrap={'wrap'}
        alignContent={'flex-start'}
        style={{
          padding,
          fontSize: 25 * conversion + 'px',
          lineHeight: 36 * conversion + 'px',
        }}
      >
        {children}
      </Flex>
      <PageDivider
        visible={itemState?.index % 2 == 0}
        overflowCol={false}
        isOverflowing={false}
      />
    </Box>
  )
}

// Type definitions for better TypeScript support
interface ModulesProps {
  value: FontModule[]
  sections?: FontSection[]
  isDraftMode?: boolean
}

const Modules = React.memo(function Modules({
  value,
  sections,
  isDraftMode = false,
}: ModulesProps) {
  // Validate input data
  const isValidData = useMemo(() => {
    return Array.isArray(value) && value.length > 0
  }, [value])

  const font = useFont()
  const renderValue = useMemo(
    () =>
      value.map((module) => ({
        ...module,
        _type:
          module._type === 'module.features'
            ? 'feature'
            : module._type.replace(/^module\./, ''),
      })),
    [value]
  )
  const sectionProps = useMemo(() => {
    const byTarget = new Map(
      sections?.map((section) => [section.targetKey, section])
    )
    return (key: string) => ({ section: byTarget.get(key), isDraftMode })
  }, [sections, isDraftMode])

  // Memoize the components object to prevent recreation on each render
  const components: PortableTextComponents = useMemo(
    () => ({
      types: {
        styles: (props: PortableTextTypeComponentProps<FontModule>) => (
          <SinglePage
            font={font}
            value={props.value}
            {...sectionProps(props.value._key)}
          >
            <StylesModule {...props} />
          </SinglePage>
        ),
        info: (props: PortableTextTypeComponentProps<FontModule>) => (
          <SinglePage
            font={font}
            value={props.value}
            {...sectionProps(props.value._key)}
          >
            <InfoModule {...props} />
          </SinglePage>
        ),
        content: (
          props: PortableTextTypeComponentProps<
            Extract<FontModule, { _type: 'content' | 'module.content' }>
          >
        ) => (
          <DoublePage
            value={props.value}
            font={font}
            textAlign={props.value.centered ? 'center' : 'left'}
            overflowCol={props.value.overflowCol ?? false}
            {...sectionProps(props.value._key)}
          >
            <ContentModule {...props} />
          </DoublePage>
        ),
        book: (props: PortableTextTypeComponentProps<FontModule>) => (
          <SinglePage
            font={font}
            value={props.value}
            {...sectionProps(props.value._key)}
          >
            <BookModule {...props} />
          </SinglePage>
        ),
        // Renamed from 'feature' for clarity
        feature: (props: PortableTextTypeComponentProps<FontModule>) => (
          <SinglePage
            font={font}
            value={props.value}
            {...sectionProps(props.value._key)}
          >
            <FeaturesModule {...props} />
          </SinglePage>
        ),
        tester: (props: PortableTextTypeComponentProps<FontModule>) => (
          <DoublePage
            value={props.value}
            font={font}
            spreadMode={true}
            overflowCol={true}
            {...sectionProps(props.value._key)}
          >
            <TesterModule {...props} />
          </DoublePage>
        ),
      },
    }),
    [font, sectionProps]
  ) // Only recreate when font or data validation changes

  // If data is invalid, return empty component or fallback
  if (!isValidData) {
    return null
  }

  // Return memoized PortableText component with valid data
  return (
    <PortableText
      value={renderValue as PortableTextBlock[]}
      components={components}
      onMissingComponent={false}
    />
  )
})

// Add display name for better debugging
Modules.displayName = 'Modules'

export default Modules
