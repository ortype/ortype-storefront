import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { InsertBelowIcon } from '@sanity/icons'
import { useBookLayoutStore } from 'components/data/BookProvider'
import GetBlocks from 'components/data/BookProvider/GetBlocks'
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
    // how to subtract this
  }

  // what's the distance from the top edge of the font, to the top edge of the content box?
  // our goal is to calculate a pixel negative top offset that will create a equal visual
  // distance from the top edge of 'a capitial letter' to the 'label'
  const transformValue = -fontSize * distanceTop

  return {
    transformValue, // @TODO: rename... the difference is the previous block's "offset top" (negative top value)
    // this only applies to blocks within the same column
    outerWrapperMarginTop: `${difference * conversion}px`, // @TODO: fluid-responsive values
    outerWrapperMarginBottom: `${marginBottom * conversion}px`, // @TODO: fluid-responsive values
    innerWrapperStyle: {
      lineHeight: `${calcLineHeight * conversion}px`, // @TODO: fluid-responsive values
      height: `${height * conversion}px`, // @TODO: fluid-responsive values
      fontSize: `${fontSize * conversion}px`, // @TODO: fluid-responsive values
    },
    // css `top` of absolutely positioned Box (what does this do precisely?)
    offsetValue: `${transformValue * conversion}px`, // @TODO: fluid-responsive values
    conversion,
  }
}

const Column = observer(
  ({ conversion, width, blocks, update }: ColumnProps) => {
    const bookLayoutStore = useBookLayoutStore()

    // @TODO: account for 30px total x margin in column

    let hardCodedColumnWidth = 558 // the total page size not including margin left/right
    if (width !== 100) {
      hardCodedColumnWidth = hardCodedColumnWidth - 30
    }

    const queryWidth = Math.floor(Number((width / 100) * hardCodedColumnWidth))

    // we store the difference of each block
    let difference = 0
    const renderBlocks = () =>
      blocks.map((block, idx) => {
        const { blockId, variantId, ...queryArgs } = block
        const humanReadableDedupId = `H${currentHour}_${update.page}_C${update.col}_B${idx}_${blockId}`
        const layout = getBlockStyle(block, {
          conversion,
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
        _hover={{
          ['.colGuide']: {
            backgroundColor: bookLayoutStore.editMode && `#dcbaff`,
          },
          ['.addColumnButton']: {
            visibility: bookLayoutStore.editMode && `visible`,
          },
        }}
      >
        <Box
          className={'colGuide'}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '1px',
            backgroundColor: 'transparent',
          }}
        />
        <Box
          className={'colGuide'}
          sx={{
            position: 'absolute',
            right: 0,
            left: 0,
            bottom: 0,
            height: '1px',
            backgroundColor: 'transparent',
          }}
        />
        <Box
          className={'colGuide'}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'transparent',
          }}
        />
        <Box
          className={'colGuide'}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'transparent',
          }}
        />
        {bookLayoutStore.editMode && (
          <ColumnPopover update={update} blocks={blocks} />
        )}
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
      </Flex>
    )
  }
)

export default Column
