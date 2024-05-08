import { Button, Flex, Text } from '@chakra-ui/react'
import { InsertBelowIcon } from '@sanity/icons'
import { useBookLayoutStore } from 'components/data/BookProvider'
import GetBlocks from 'components/data/BookProvider/GetBlocks'
import useDimensions from 'components/hooks/useDimensions'
import { observer } from 'mobx-react-lite'
import React, { useContext, useRef } from 'react'
import Block from './Block'
import {
  type BlockParams,
  type BlockStyle,
  type BlockStyleOptions,
  type BlockStyleParams,
  type ColumnProps,
  type Metrics,
} from './bookTypes'

import { ColumnPopover } from './index'

const currentHour = new Date().getUTCHours()

// https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align

/*
{key: "ascent", value: "978"}
{key: "descent", value: "222"}
{key: "capHeight", value: "700"}
*/

// util function to add `contentArea` and `distanceTop` keys to the props
const getBlockStyle = (
  params: BlockStyleParams,
  options: BlockStyleOptions
): BlockStyle => {
  const { fontSize, lineGap, marginBottom, lineCount } = params
  const { contentArea, distanceTop, ascent, capHeight, descent, difference } =
    options

  const calcLineHeight = fontSize * contentArea

  let height = calcLineHeight * lineCount
  if (lineGap !== null && lineGap !== 0) {
    if (lineGap > 0) {
      height = height - lineGap * lineCount
    } else {
      height = height + lineGap * lineCount
    }
    // how to subtract this
  }

  // what's the distance from the top edge of the font, to the top edge of the content box?
  // our goal is to calculate a pixel negative top offset that will create a equal visual
  // distance from the top edge of 'a capitial letter' to the 'label'
  const transformValue = -fontSize * distanceTop

  return {
    transformValue, // @TODO: rename... the difference is the previous block's "offset top" (negative top value)
    outerWrapperMarginTop: `${difference}px`, // @TODO: ah this only applies to blocks within the same column
    outerWrapperMarginBottom: `${marginBottom}px`,
    innerWrapperStyle: {
      lineHeight: `${calcLineHeight}px`,
      height: `${height}px`,
      fontSize: `${fontSize}px`,
    },
    offsetValue: `${transformValue}px`, // css `top` of absolutely positioned Box (what does this do precisely?)
  }
}

const Column = observer(({ width, blocks, update }: ColumnProps) => {
  const bookLayoutStore = useBookLayoutStore()
  const targetRef = useRef()
  // const size = useDimensions(targetRef, width)

  const hardCodedColumnWidth = 558
  const queryWidth = Number((width / 100) * hardCodedColumnWidth)

  // we store the difference of each block
  let difference = 0
  const renderBlocks = () =>
    blocks.map((block, idx) => {
      const { blockId, variantId, ...queryArgs } = block
      const humanReadableDedupId = `H${currentHour}_${update.page}_C${update.col}_B${idx}_${blockId}`
      const layout = getBlockStyle(block, {
        ...bookLayoutStore.metrics,
        // @TODO: consider passing `blockParams` like fontSize, lineHeight, lineCount to get metrics()
        // to centeralize most of the calculations in the `store` (however, the getter cannot take params)
        difference,
      })
      difference = layout.transformValue

      return (
        <GetBlocks
          key={blockId}
          // update param contains the which `page`, the `column` index, and `block` index
          update={{
            block: idx,
            ...update,
          }}
          component={Block}
          line={{
            dedupId: humanReadableDedupId,
            colWidth: queryWidth, // colWidth: size.width,
            variantId: variantId || bookLayoutStore.variantOption.value,
            ...queryArgs,
          }}
          layout={layout} // BlockStyle
        />
      )
    })

  const handleClick = () => {
    bookLayoutStore.addBlock(update.page, update.col)
  }

  if (!bookLayoutStore.editMode) {
    return (
      <Flex
        ref={targetRef}
        flexDir={'column'}
        flexWrap={'wrap'}
        flex={`0 0 calc(${width}% - 30px)`} // 588 - 30 = 558
        maxW={`calc(${width}% - 30px)`}
        m={'0 15px'}
        position={'relative'}
      >
        {renderBlocks()}
      </Flex>
    )
  }

  return (
    <Flex
      ref={targetRef}
      flexDir={'column'}
      flexWrap={'wrap'}
      flex={`0 0 calc(${width}% - 30px)`}
      maxW={`calc(${width}% - 30px)`}
      m={'0 15px'}
      position={'relative'}
      _hover={{
        background: `#f1f1f18a`,
        ['.addColumnButton']: {
          visibility: `visible`,
        },
      }}
    >
      <ColumnPopover update={update} blocks={blocks}>
        {renderBlocks()}
        <Button
          onClick={handleClick}
          // variant={'ghost'}
          fontSize={'2xl'}
          className={'addColumnButton'}
          sx={{
            visibility: `hidden`,
            position: `absolute`,
            bottom: `-1rem`,
            left: `calc(50% - 1rem)`,
            padding: `.2rem`,
            width: `2rem`,
            height: `2rem`,
            zIndex: 1,
          }}
        >
          <InsertBelowIcon />
        </Button>
      </ColumnPopover>
    </Flex>
  )
})

export default Column
