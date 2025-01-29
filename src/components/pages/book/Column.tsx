import {
  BlockParams,
  Update,
  type BlockStyle,
  type BlockStyleOptions,
  type BlockStyleParams,
  type ColumnProps,
  type Metrics,
} from '@/components/composite/Book/bookTypes'
import { useFont } from '@/components/pages/fonts/FontContainer'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { useBookLayoutStore } from '@/components/data/BookProvider'
import React, { useContext, useRef } from 'react'
import Block from './Block'

const getBlockStyle = (
  params: BlockStyleParams,
  options: BlockStyleOptions
): BlockStyle => {
  const { fontSize, lineGap, marginBottom, lineCount } = params
  const {
    contentArea,
    distanceTop,
    ascent,
    capHeight,
    descent,
    difference,
    conversion,
  } = options

  const calcLineHeight = fontSize * contentArea

  let height = calcLineHeight * lineCount
  if (lineGap !== null && lineGap !== 0) {
    if (lineGap > 0) {
      height = height - lineGap * lineCount
    } else {
      height = height + lineGap * lineCount
    }
  }

  const transformValue = -fontSize * distanceTop

  return {
    transformValue,
    outerWrapperMarginTop: `${difference * conversion}px`,
    outerWrapperMarginBottom: `${marginBottom * conversion}px`,
    innerWrapperStyle: {
      lineHeight: `${calcLineHeight * conversion}px`,
      height: `${height * conversion}px`,
      fontSize: `${fontSize * conversion}px`,
    },
    offsetValue: `${transformValue * conversion}px`,
    conversion,
  }
}

type ColumnProps = {
  defaultVariantId: string
  width: number
  colWidth: number
  conversion: number
  blocks: BlockParams[]
  update: Update
}

const Column = ({
  conversion,
  width,
  blocks,
  defaultVariantId,
  colWidth,
}: ColumnProps) => {
  const font = useFont()
  if (width !== 100) {
    colWidth = colWidth - 30
  }

  const queryWidth = Math.floor(Number((width / 100) * colWidth))
  // we store the difference of each block
  let difference = 0

  return (
    <Flex
      className={'column'}
      flexDir={'column'}
      flexWrap={'wrap'}
      style={{
        flex: `0 0 calc(${width}% - ${30 * conversion}px)`,
        maxWidth: `calc(${width}% - ${30 * conversion}px)`,
        margin: `0 ${15 * conversion}px`,
      }}
      position={'relative'}
    >
      {blocks.map((block, idx) => {
        if (font?.metrics) {
          const { blockId, variantId, ...queryArgs } = block
          const layout = getBlockStyle(block, {
            conversion,
            ...font.metrics,
            difference,
          })
          difference = layout.transformValue

          return (
            <Block
              key={blockId}
              line={{
                blockId: blockId,
                colWidth: queryWidth,
                variantId: variantId || defaultVariantId,
                ...queryArgs,
              }}
              layout={layout} // BlockStyle
              entry={block.entry}
            />
          )
        }
      })}
    </Flex>
  )
}

export default Column
