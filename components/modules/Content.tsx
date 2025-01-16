import PortableText from '@/components/modules/PortableText'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import OverflowDetector from './OverflowDetector'

const Content: React.FC<{
  value: any
  index: number
}> = ({ value, index }) => {
  const { padding, conversion } = useSpreadContainer()
  return (
    <>
      {
        // @TODO: in the case of `isSpread` we need a title for each 'column/page'
        value.title && (
          <Box
            pos={'absolute'}
            top={0}
            right={0}
            left={0}
            style={{
              padding: `0 ${padding}`,
            }}
          >
            <Heading
              pt={'0.5rem'}
              pb={'0.25rem'}
              borderBottom={'1px solid #000'}
              fontSize={`${13 * conversion}px`}
              lineHeight={`1.5`}
              color={'red'}
              textAlign={'center'}
              fontWeight={'normal'}
              textTransform={'uppercase'}
            >
              {value.title}
            </Heading>
          </Box>
        )
      }
      <OverflowDetector
        index={index}
        _key={value._key}
        overflowCol={value.overflowCol}
      >
        <PortableText value={value.body} index={index} />
      </OverflowDetector>
    </>
  )
}

export default Content
