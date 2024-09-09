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

const SpreadPage = ({ children, index, spreadMode, overflowCol, ...props }) => {
  const { pseudoPadding, dispatch, spreadAspect, pageAspect, padding, state } =
    useSpreadContainer()
  const isOverflowing = state[index]?.value

  const isSpread = spreadMode && isOverflowing && overflowCol

  useEffect(() => {
    let i = index
    if (isSpread) {
      i = index + 1
    }
    // @NOTE: spreadMode and overflowCol are virtually the same thing I think
    if (!spreadMode || !overflowCol) {
      // previous state has overflow and overflowCol (or spreadMode)
      // bump the index up by 1 to account for phantom page

      // @NOTE: ok this doesn't work for the following pages/spreads
      // we need a way of counting up from the bottom, and always adding 1 more
      // should we store each module in the SpreadContainer.state by `_key` along with
      // an `index` prop which we generate (?)

      // state[value._key]
      // the state is an object with keys

      /*
      const keys = Object.keys(test);
      const index = keys.indexOf('y');
      console.log(test[keys[index - 1]]);
      */

      if (state[index - 1]?.value === true && state[index - 1]?.overflowCol) {
        dispatch({
          type: 'SET_OVERFLOW',
          index: i + 1,
          isOverflowing: { value: false, overflowCol: false },
        })
      } else {
        dispatch({
          type: 'SET_OVERFLOW',
          index: i,
          isOverflowing: { value: false, overflowCol: false },
        })
      }
    }
  }, [isSpread])

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
        // @NOTE: we need to consider any index's that become a spread
        visible={index % 2 == 0}
        overflowCol={overflowCol}
        isOverflowing={isOverflowing}
      />
    </Box>
  )
}

const components = {
  types: {
    styles: (props) => (
      <SpreadPage index={props.index} spreadMode={false}>
        <StylesModule {...props} />
      </SpreadPage>
    ),
    info: (props) => (
      <SpreadPage index={props.index} spreadMode={false}>
        <InfoModule {...props} />
      </SpreadPage>
    ),
    content: (props) => (
      <SpreadPage
        index={props.index}
        textAlign={props.value.centered ? 'center' : 'left'}
        overflowCol={props.value.overflowCol}
        spreadMode={true}
      >
        <ContentModule {...props} />
      </SpreadPage>
    ),
    book: (props) => (
      <SpreadPage index={props.index} spreadMode={false}>
        <BookModule {...props} />
      </SpreadPage>
    ),
    // @TODO: rename to 'features'?
    feature: (props) => (
      <SpreadPage index={props.index} spreadMode={false}>
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
