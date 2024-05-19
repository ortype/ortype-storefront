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
        <Flex
          position={'relative'}
          mb={'10.8px'}
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
              fontSize={'12px'}
              position={'absolute'}
              top={'2px'}
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
              mt={`32.4px`} // account for height of the "label"
              style={{
                width: `${line.colWidth}px`,
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
                  <Text as={'span'} fontSize={'12px'}>{`Loading...`}</Text>
                ) : (
                  <Box
                    as={'div'}
                    // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
                    whiteSpace={'pre-wrap'}
                    dangerouslySetInnerHTML={{ __html: word }}
                    sx={{
                      span: {
                        display: 'block',
                        mt: `${line.lineGap}px`,
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
        </Flex>
      )
    }

    return (
      <Flex
        position={'relative'}
        mb={'10.8px'}
        style={{
          marginTop: layout.outerWrapperMarginTop,
          marginBottom: layout.outerWrapperMarginBottom,
        }}
      >
        <Text as={'span'} fontSize={'12px'} position={'absolute'} top={'2px'}>
          {
            bookLayoutStore.variantOptions.find(
              ({ value }) => line.variantId === value
            )?.label
          }
        </Text>
        <Box
          className={line.variantId}
          position={'relative'}
          mt={`32.4px`}
          w={`${line.colWidth}px`}
          style={{
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
                  mt: `${line.lineGap}px`,
                },
                'span:first-of-type': {
                  mt: 0,
                },
              }}
            />
          </Box>
        </Box>
      </Flex>
    )
  }
)

export default Block
