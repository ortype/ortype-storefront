import { Box, Container, Flex, Text } from '@chakra-ui/react'
import BlockPopover from 'components/composite/Book/BlockPopover'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'
import { type BlockStyle, type LineParams, type Update } from './bookTypes'

const Block: React.FC<{
  entry: string
  line: LineParams
  isLoadingBookItem: boolean
  layout: BlockStyle
  fetchMore: any // @TODO: types
  update: Update
}> = observer(
  ({ entry, line, update, isLoadingBookItem, layout, fetchMore }) => {
    const bookLayoutStore = useBookLayoutStore()
    const [word, setWord] = useState(entry)
    useEffect(() => {
      setWord(entry)
    }, [isLoadingBookItem, entry])

    if (bookLayoutStore.editMode) {
      return (
        <Box
          position={'relative'}
          id={line.dedupId}
          style={{
            marginTop: layout.outerWrapperMarginTop,
            marginBottom: layout.outerWrapperMarginBottom,
          }}
          _hover={{
            backgroundColor: `#F8FFBF82`,
            ['.configBlockButton']: {
              visibility: `visible`,
            },
          }}
        >
          <BlockPopover
            line={line}
            update={update}
            setWord={setWord}
            isLoadingBookItem={isLoadingBookItem}
            fetchMore={fetchMore}
          >
            <Text
              as={'span'}
              style={{
                fontSize: `${12 * layout.conversion}px`,
                top: `${2 * layout.conversion}px`,
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
              style={{
                // width: `${line.colWidth}px`,
                marginTop: `${32.4 * layout.conversion}px`, // account for height of the "label"
                width: '100%',
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
                {isLoadingBookItem ? (
                  <Text
                    as={'span'}
                    style={{ fontSize: `${12 * layout.conversion}px` }}
                  >{`Loading...`}</Text>
                ) : (
                  <Box
                    as={'div'}
                    // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
                    whiteSpace={'pre-wrap'}
                    dangerouslySetInnerHTML={{ __html: word }}
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
                )}
              </Box>
            </Box>
          </BlockPopover>
        </Box>
      )
    }

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
            top: `${10.8 * layout.conversion}px`,
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
          w={'100%'} // w={`${line.colWidth}px`}
          style={{
            marginTop: `${10.8 * layout.conversion}px`,
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
              // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
              whiteSpace={'pre-wrap'}
              dangerouslySetInnerHTML={{ __html: word }}
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
)

export default Block
