import { Button, Flex, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { InsertBelowIcon } from '@sanity/icons'
import { BookContext } from 'components/data/BookProvider'
import GetBlocks from 'components/data/BookProvider/getBlocks'
import useDimensions from 'components/hooks/useDimensions'
import { observer } from 'mobx-react-lite'
import PropTypes from 'prop-types'
import React, { useContext, useRef } from 'react'
import Block from './Block'

import { ColumnPopover } from './index'

const currentHour = new Date().getUTCHours()

// util function to add `contentArea` and `distanceTop` keys to the props
const getBlockStyle = (
  { fontSize, lineHeight, lineCount },
  { contentArea, distanceTop, difference }
) => {
  const marginTopOffset = lineHeight
  const calcLineHeight = fontSize * contentArea
  const transformValue = -fontSize * distanceTop
  return {
    transformValue,
    outerWrapperMarginTop: marginTopOffset
      ? difference + marginTopOffset
      : difference,
    // applies to Guides, the wrapper of the entry
    innerWrapperStyle: {
      // transform: `translateY(${transformValue}px)`,
      lineHeight: `${calcLineHeight}px`,
      height: `${calcLineHeight * lineCount}px`,
      fontSize: `${fontSize}px`,
    },
    offsetValue: `${transformValue}px`,
  }
}

const Column = observer(({ width, blocks, update }) => {
  const bookLayoutStore = useContext(BookContext)
  const targetRef = useRef()
  const size = useDimensions(targetRef, width)
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
          update={{
            block: idx,
            ...update,
          }}
          component={Block}
          line={{
            dedupId: humanReadableDedupId,
            colWidth: size.width,
            variantId: variantId || bookLayoutStore.variantOption.value,
            ...queryArgs,
          }}
          layout={layout}
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
        flex={`0 0 calc(${width}% - 30px)`}
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
      <ColumnPopover update={update} width={width}>
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

/*
Column.propTypes = {
  blocks: PropTypes.array,
  update: PropTypes.object,
  width: PropTypes.number,
}
*/
export default Column
