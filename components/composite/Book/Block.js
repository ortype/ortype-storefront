import { Box, Container, Flex, Text } from '@chakra-ui/react'
import BlockPopover from 'components/composite/Book/BlockPopover'
import { BookContext } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useState } from 'react'

const Block = observer((props) => {
  const { entry, line, isLoadingBookItem, layout } = props
  const bookLayoutStore = useContext(BookContext)
  const [word, setWord] = useState(entry)
  useEffect(() => {
    setWord(entry)
  }, [isLoadingBookItem, entry])

  if (bookLayoutStore.editMode) {
    return (
      <Flex
        position={'relative'}
        mb={'10.8px'}
        mt={layout.outerWrapperMarginTop}
        _hover={{
          backgroundColor: `#F8FFBF82`,
          ['.configBlockButton']: {
            visibility: `visible`,
          },
        }}
      >
        <BlockPopover {...props} setWord={setWord} fetchMore={props.fetchMore}>
          <Text fontSize={'12px'} position={'absolute'} top={'2px'}>
            {
              bookLayoutStore.variantOptions.find(
                ({ value }) => line.variantId === value
              )?.label
            }
          </Text>
          {isLoadingBookItem ? (
            <Text fontSize={'12px'}>{`Loading...`}</Text>
          ) : (
            <Box
              className={line.variantId}
              position={'relative'}
              mt={`32.4px`}
              w={`${line.colWidth}px`}
              sx={{
                ...layout.innerWrapperStyle,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: `${layout.offsetValue}`,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <Box
                  as={'span'}
                  // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
                  whiteSpace={'pre-wrap'}
                >
                  {word}
                </Box>
              </Box>
            </Box>
          )}
        </BlockPopover>
      </Flex>
    )
  }

  return (
    <Flex position={'relative'} mb={'10.8px'} mt={layout.outerWrapperMarginTop}>
      <Text fontSize={'12px'} position={'absolute'} top={'2px'}>
        {
          bookLayoutStore.variantOptions.find(
            ({ value }) => line.variantId === value
          ).label
        }
      </Text>
      <Box
        className={line.variantId}
        position={'relative'}
        mt={`32.4px`}
        w={`${line.colWidth}px`}
        sx={{
          ...layout.innerWrapperStyle,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: `${layout.offsetValue}`,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Box
            as={'span'}
            // whiteSpace={line.lineCount === 1 ? 'nowrap' : 'pre-wrap'}
            whiteSpace={'pre-wrap'}
          >
            {word}
          </Box>
        </Box>
      </Box>
    </Flex>
  )
})
/*
Block.propTypes = {
  entry: PropTypes.string,
  isLoadingBookItem: PropTypes.bool,
  line: PropTypes.object,
}
*/
export default Block
