'use client'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import config from '@/sanity.config'
import { Box } from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import { type PortableTextBlock } from 'next-sanity'
import { useEffect } from 'react'
import BookModule from './Book'
import ContentModule from './Content'
import FeaturesModule from './Features'
import InfoModule from './Info'
import StylesModule from './Styles'

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

const SpreadPage = ({
  children,
  _key,
  spreadMode = false,
  overflowCol,
  ...props
}) => {
  const { spreadAspect, pageAspect, padding, state } = useSpreadContainer()
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
        // @TODO: no aspect for < lg breakpoint?
        paddingBottom: isSpread ? spreadAspect : pageAspect,
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
      {children}
      <PageDivider
        visible={itemState.index % 2 == 0}
        overflowCol={overflowCol}
        isOverflowing={isOverflowing}
      />
    </Box>
  )
}

const components = {
  types: {
    styles: (props) => (
      <SpreadPage _key={props.value._key}>
        <StylesModule {...props} />
      </SpreadPage>
    ),
    info: (props) => (
      <SpreadPage _key={props.value._key}>
        <InfoModule {...props} />
      </SpreadPage>
    ),
    content: (props) => (
      <SpreadPage
        _key={props.value._key}
        textAlign={props.value.centered ? 'center' : 'left'}
        overflowCol={props.value.overflowCol}
      >
        <ContentModule {...props} />
      </SpreadPage>
    ),
    book: (props) => (
      <SpreadPage _key={props.value._key}>
        <BookModule {...props} />
      </SpreadPage>
    ),
    // @TODO: rename to 'features'?
    feature: (props) => (
      <SpreadPage _key={props.value._key}>
        <FeaturesModule {...props} />
      </SpreadPage>
    ),
    // @TODO: type tester module
    /*
    tester: (props) => (
      <SpreadPage
        _key={props.value._key}
        spreadMode={true}
      >
        <TesterModule {...props} />
      </SpreadPage>
    ),    
    */
  },
}

const Modules = ({ value }) => {
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
