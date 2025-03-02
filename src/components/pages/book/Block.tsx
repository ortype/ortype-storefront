import {
  type BlockStyle,
  type LineParams,
} from '@/components/composite/Book/bookTypes'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { Box, Container, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'

const Block: React.FC<{
  entry: string
  delay: number
  line: LineParams
  layout: BlockStyle
  inView?: boolean
}> = ({ delay, entry, line, layout, inView = false }) => {
  const font = useFont()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: 0.1,
        delay: delay,
        ease: 'easeOut',
      }}
      className={'block'}
      style={{
        position: 'relative',
        marginTop: layout.outerWrapperMarginTop,
        marginBottom: layout.outerWrapperMarginBottom,
      }}
    >
      <Text
        as={'span'}
        style={{
          fontSize: `${12 * layout.conversion}px`,
          top: `${7 * layout.conversion}px`,
          lineHeight: `1.25`,
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
          css={{
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
            css={{
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
    </motion.div>
  )
}

export default Block
