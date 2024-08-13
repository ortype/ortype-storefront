import { Box, Container, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { useFont } from '@/components/pages/fonts/FontContainer'
import {
  type BlockStyle,
  type LineParams,
} from '@/components/composite/Book/bookTypes'

const Block: React.FC<{
  entry: string
  line: LineParams
  layout: BlockStyle
}> = ({ entry, line, layout }) => {
  const font = useFont()

  return (
    <Box
      position={'relative'}
      style={{
        marginTop: layout.outerWrapperMarginTop,
        marginBottom: layout.outerWrapperMarginBottom,
      }}
    >
      <Text
        as={'span'}
        style={{
          fontSize: `${12 * layout.conversion}px`,
          top: `${7 * layout.conversion}px`,
        }}
        position={'absolute'}
      >
        {font?.variants.find(({ _id }) => line.variantId === _id)?.optionName}
      </Text>
      <Box
        className={line.variantId || ''}
        position={'relative'}
        w={'100%'}
        style={{
          marginTop: `${32.4 * layout.conversion}px`, // account for height of the "label"
          ...layout.innerWrapperStyle,
        }}
      >
        <Box
          style={{
            top: `${layout.offsetValue}`,
          }}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box
            as={'div'}
            whiteSpace={'pre-wrap'}
            dangerouslySetInnerHTML={{ __html: entry }}
            sx={{
              span: {
                display: 'block',
                mt: `${line.lineGap * layout.conversion}px`,
              },
              'span:first-of-type': {
                mt: 0,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Block
