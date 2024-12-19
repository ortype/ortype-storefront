'use client'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import config from '@/sanity.config'
import { MIN_DEFAULT_MQ } from '@/utils/presets'
import { Box, Flex } from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import { createDataAttribute } from '@sanity/visual-editing'
import {
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import { useEffect } from 'react'
import BookModule from './Book'
import ContentModule from './Content'
import FeaturesModule from './Features'
import InfoModule from './Info'
import StylesModule from './Styles'
import TesterModule from './Tester'

type PageDividerProps = {
  visible: boolean
  overflowCol: boolean
  isOverflowing: boolean
}

const PageDivider: React.FC<PageDividerProps> = ({
  visible,
  overflowCol,
  isOverflowing,
}) => {
  // isOverflowing && overflowCol
  const isSpread = isOverflowing && overflowCol

  return (
    <Box
      className={'page-divider'}
      sx={{
        display: visible ? 'block' : 'none',
        position: 'absolute',
        width: '2px',
        background: '#C6C6C6',
        height: '100%',
        pointerEvents: 'none',
        top: 0,
        right: !isSpread && 0,
        left: isSpread && '50%',
        zIndex: 'docked',
      }}
    />
  )
}

const DoublePage = ({
  children,
  value,
  spreadMode = false,
  overflowCol,
  ...props
}) => {
  const { _key } = value
  const { spreadAspect, conversion, pageAspect, padding, state } =
    useSpreadContainer()
  const isOverflowing = state.items[_key]?.isOverflowing
  const itemState = state.items[_key]
  const isSpread = spreadMode || (isOverflowing && overflowCol)

  return (
    <Box
      className={'spread-page'}
      flex={{ base: '0 0 100%', lg: isSpread ? '0 0 100%' : '0 0 50%' }} // responsive values
      mb={padding}
      position="relative"
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        // @TODO: no aspect for < lg breakpoint? only if it is not the book which
        // always has an aspect?
        // paddingBottom: isSpread ? spreadAspect : pageAspect,
        paddingBottom: { base: 0, lg: isSpread ? spreadAspect : pageAspect },
      }}
      sx={{
        p: {
          // @NOTE: either manual enter line-breaks `/n` with shift+return
          // in the editor or we define a maxW only when centered
          // maxW: props.textAlign === 'center' ? '85%' : '100%',
          // mx: 'auto',
        },
      }}
      {...props}
    >
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

const SinglePage = ({ children, _key, font, index, value, ...props }) => {
  const { pageAspect, padding, conversion, state } = useSpreadContainer()
  const itemState = state.items[_key]

  const attr = createDataAttribute({
    id: font?._id,
    type: 'font',
    path: 'modules',
  })

  return (
    <Box
      className={'single-page'}
      data-sanity={attr(`[${index}]`).toString()}
      flex={{ base: '0 0 100%', lg: '0 0 50%' }} // responsive values
      mb={padding}
      position="relative"
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        paddingBottom: pageAspect,
      }}
      sx={{
        p: {
          // @NOTE: either manual enter line-breaks `/n` with shift+return
          // in the editor or we define a maxW only when centered
          // maxW: props.textAlign === 'center' ? '85%' : '100%',
          // mx: 'auto',
        },
      }}
      {...props}
    >
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

const Modules = ({ value }) => {
  const font = useFont()

  const components: PortableTextComponents = {
    types: {
      styles: (props) => (
        <SinglePage font={font} value={props.value} index={props.index}>
          <StylesModule {...props} />
        </SinglePage>
      ),
      info: (props) => (
        <DoublePage value={props.value}>
          <InfoModule {...props} />
        </DoublePage>
      ),
      content: (props) => (
        <DoublePage
          value={props.value}
          textAlign={props.value.centered ? 'center' : 'left'}
          overflowCol={props.value.overflowCol}
        >
          <ContentModule {...props} />
        </DoublePage>
      ),
      book: (props) => (
        <SinglePage font={font} value={props.value} index={props.index}>
          <BookModule {...props} />
        </SinglePage>
      ),
      // @TODO: rename to 'features'?
      feature: (props) => (
        <SinglePage font={font} value={props.value} index={props.index}>
          <FeaturesModule {...props} />
        </SinglePage>
      ),
      // @TODO: type tester module
      tester: (props) => (
        <DoublePage value={props.value} spreadMode={true}>
          <TesterModule {...props} />
        </DoublePage>
      ),
    },
  }

  return (
    <PortableText
      value={value as PortableTextBlock[]}
      components={components}
      onMissingComponent={false}
      {...config}
    />
  )
}

export default Modules
