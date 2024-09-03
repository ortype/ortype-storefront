'use client'
import config from '@/sanity.config'
import { Box } from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import { type PortableTextBlock } from 'next-sanity'
import { useSpreadContainer } from '../pages/fonts/SpreadContainer'
import BookModule from './Book'
import ContentModule from './Content'
import FeaturesModule from './Features'
import InfoModule from './Info'

type PageDividerProps = {
  visible: boolean
}

const PageDivider: React.FC<PageDividerProps> = ({ visible }) => {
  return (
    <Box
      sx={{
        display: visible ? 'block' : 'none',
        position: 'absolute',
        width: '2px',
        background: '#C6C6C6',
        height: '100%',
        pointerEvents: 'none',
        top: 0,
        right: 0,
        zIndex: 'popover',
      }}
    />
  )
}

const SpreadPage = ({ children, index }) => {
  const { pseudoPadding, padding } = useSpreadContainer()
  return (
    <Box
      // flex={{ base: '100%', lg: '0 0 50%' }} // responsive values
      flex={'0 0 50%'} // responsive base breakpoint set to 100% only does part of the job
      mb={padding}
      position="relative"
      // the before creates the height
      _before={{
        height: 0,
        content: `""`,
        display: 'block',
        paddingBottom: pseudoPadding,
      }}
      // #C6C6C6
    >
      {children}
      <PageDivider visible={index % 2 == 0} />
    </Box>
  )
}

const components = {
  types: {
    info: (props) => (
      <SpreadPage index={props.index}>
        <InfoModule {...props} />
      </SpreadPage>
    ),
    content: (props) => (
      <SpreadPage index={props.index}>
        <ContentModule {...props} />
      </SpreadPage>
    ),
    book: (props) => (
      <SpreadPage index={props.index}>
        <BookModule {...props} />
      </SpreadPage>
    ),
    // @TODO: rename to 'features'?
    feature: (props) => (
      <SpreadPage index={props.index}>
        <FeaturesModule {...props} />
      </SpreadPage>
    ),
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
