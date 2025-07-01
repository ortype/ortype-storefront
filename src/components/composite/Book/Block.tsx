import BlockPopover from '@/components/composite/Book/BlockPopover'
import { useBookLayoutStore } from '@/components/data/BookProvider'
import { Box, Container, Flex, Text } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import { LuBoomBox } from 'react-icons/lu'
import { type BlockStyle, type LineParams, type Update } from './bookTypes'

const EntrySpans = ({ entry, line, layout }) => {
  // Split the string by the closing tag of the span
  const elements = entry.split(/<\/span>/).map((item, index) => {
    // Trim the item and check if it's not empty
    const trimmedItem = item.trim()
    if (trimmedItem) {
      return (
        <Box
          as={'span'}
          key={index}
          display={'block'}
          style={{
            marginTop:
              index === 0 ? 0 : `${line.lineGap * layout.conversion}px`,
          }}
        >
          {trimmedItem.replace(/<span>/, '')}
        </Box>
      )
    }
    return null
  })

  return (
    <Box as={'div'} whiteSpace={'pre-wrap'}>
      {elements}
    </Box>
  )
}

const Block: React.FC<{
  entry: string
  line: LineParams
  isLoadingBookItem: boolean
  layout: BlockStyle
  refetch: any // @TODO: types
  update: Update
}> = observer(({ entry, line, update, isLoadingBookItem, layout, refetch }) => {
  const bookLayoutStore = useBookLayoutStore()
  useEffect(() => {
    if (!isLoadingBookItem) {
      if (bookLayoutStore.updateBlock && line.entry !== entry) {
        bookLayoutStore.updateBlock(
          'entry',
          entry,
          update.page,
          update.col,
          update.block
        )
      }
    }
  }, [isLoadingBookItem, entry])

  return (
    <Box
      position={'relative'}
      id={line.dedupId}
      style={{
        marginTop: layout.outerWrapperMarginTop,
        marginBottom: layout.outerWrapperMarginBottom,
      }}
      css={{
        ['.blockGuide']: {
          // backgroundColor: bookLayoutStore.editMode && `#dcbaff`,
        },
        ['.configBlockButton']: {
          visibility: bookLayoutStore.editMode && `visible`,
        },
      }}
    >
      <Box
        className={'blockGuide'}
        css={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '1px',
          backgroundColor: 'transparent',
        }}
      />
      <Box
        className={'blockGuide'}
        css={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '1px',
          backgroundColor: 'transparent',
        }}
      />
      {bookLayoutStore.editMode && (
        <BlockPopover
          line={line}
          update={update}
          isLoadingBookItem={isLoadingBookItem}
          refetch={refetch}
        />
      )}
      <Text
        as={'span'}
        style={{
          fontSize: `${12 * layout.conversion}px`,
          top: `${7 * layout.conversion}px`,
        }}
        position={'absolute'}
      >
        {
          bookLayoutStore.variantOptions.find(
            ({ value }) => line.variantId === value
          )?.label
        }
      </Text>
      <Box
        className={line.variantId}
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
          {isLoadingBookItem ? (
            <Text
              as={'span'}
              style={{ fontSize: `${12 * layout.conversion}px` }}
            >{`Loading...`}</Text>
          ) : (
            <EntrySpans entry={entry} line={line} layout={layout} />
          )}
        </Box>
      </Box>
    </Box>
  )
})

export default Block
