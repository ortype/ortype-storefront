import { Button, Flex, Text } from '@chakra-ui/react'
import { InsertBelowIcon } from '@sanity/icons'
import { useBookLayoutStore } from 'components/data/BookProvider'
import GetBlocks from 'components/data/BookProvider/getBlocks'
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
  const { fontSize, lineHeight, lineCount } = params
  const { contentArea, distanceTop, difference } = options

  const marginTopOffset = lineHeight
  const calcLineHeight = fontSize * contentArea // what is content area again?
  const transformValue = -fontSize * distanceTop // what does this achieve?

  return {
    transformValue,
    outerWrapperMarginTop: marginTopOffset
      ? difference + marginTopOffset
      : difference, // Outer margin top (what does this do precisely?) (=== lineHeight)
    // is there a case where we do not have a lineHeight?
    innerWrapperStyle: {
      lineHeight: `${calcLineHeight}px`, // fontSize * contentArea huh...
      height: `${calcLineHeight * lineCount}px`, // physical height the lines will occupy
      fontSize: `${fontSize}px`, // target fontSize
    },
    offsetValue: `${transformValue}px`, // css `top` of Box (what does this do precisely?)
  }
}

const Column = observer(({ width, blocks, update }: ColumnProps) => {
  const bookLayoutStore = useBookLayoutStore()
  const targetRef = useRef()
  // const size = useDimensions(targetRef, width)

  const hardCodedColumnWidth = 558
  const queryWidth = Math.floor((width / 100) * hardCodedColumnWidth)

  // we store the difference of each block
  let difference = 0
  const renderBlocks = () =>
    blocks.map((block, idx) => {
      const layout = getBlockStyle(block, {
        ...bookLayoutStore.metrics,
        difference,
      })
      difference = layout.transformValue

      const { blockId, variantId, ...queryArgs } = block

      const humanReadableDedupId = `H${currentHour}_${update.page}_C${update.col}_B${idx}_${blockId}`
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
