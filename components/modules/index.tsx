'use client'
import config from '@/sanity.config'
import { Box } from '@chakra-ui/react'
import { PortableText } from '@portabletext/react'
import { useSpreadContainer } from '../pages/fonts/SpreadContainer'
import BookModule from './Book'

const SpreadPage = ({ children }) => {
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
    >
      {children}
    </Box>
  )
}

const components = {
  types: {
    'module.book': (props) => (
      <SpreadPage>
        <BookModule {...props} />
      </SpreadPage>
    ),
  },
}

const Modules = ({ value }) => {
  return (
    <PortableText
      value={value}
      components={components}
      onMissingComponent={false}
      {...config}
    />
  )
}

export default Modules
