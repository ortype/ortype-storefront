import PortableText from '@/components/modules/PortableText'
import { useSpreadContainer } from '@/components/pages/fonts/SpreadContainer'
import { Box, Flex, Heading } from '@chakra-ui/react'
import React from 'react'
import OverflowDetector from './OverflowDetector'

const Header = ({ value, padding, conversion, verso, recto }) =>
  value.title && (
    <Box
      pos={'absolute'}
      top={0}
      width={recto || verso ? '50%' : '100%'}
      left={!recto && !verso ? 0 : verso ? 0 : 'auto'}
      right={!recto && !verso ? 0 : recto ? 0 : 'auto'}
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

const Content: React.FC<{
  value: any
  index: number
}> = ({ value, index }) => {
  const { padding, conversion } = useSpreadContainer()
  return (
    <OverflowDetector
      index={index}
      _key={value._key}
      overflowCol={value.overflowCol}
    >
      {(ctx) => {
        return (
          <>
            {ctx.isOverflowing && ctx.isSpread ? (
              <>
                <Header
                  value={value}
                  conversion={conversion}
                  padding={padding}
                  verso
                />
                <Header
                  value={value}
                  conversion={conversion}
                  padding={padding}
                  recto
                />
              </>
            ) : (
              <Header value={value} conversion={conversion} padding={padding} />
            )}
            <PortableText value={value.body} index={index} />
          </>
        )
      }}
    </OverflowDetector>
  )
}

export default Content
