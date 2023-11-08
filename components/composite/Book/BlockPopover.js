import { Box, Button, Checkbox, SimpleGrid, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import NumericInput from 'components/composite/Book/NumericInput'
import { BookContext } from 'components/data/BookProvider'
import React, { useContext, useState } from 'react'
import Select from 'react-select'
import { ArrowContainer, Popover } from 'react-tiny-popover'

const pointFormat = (num) => `${num}pt`

const PopoverInner = styled(`div`)({
  border: `.1rem solid #000`,
  boxShadow: `2px 2px 0px #000`,
  padding: `0.75rem`,
  backgroundColor: `#fff`,
  width: `16rem`,
})

const PopoverContent = styled(`div`)({
  cursor: `pointer`,
})

const BlockPopover = (props) => {
  const { line, update } = props
  const { page, col, block } = update

  const bookLayoutStore = useContext(BookContext)

  // Popover
  const [isPopoverOpen, setPopover] = useState(false)
  const openPopover = () => setPopover(true)
  const closePopover = () => setPopover(false)

  // fontSize, lineHeight, wordCount, lineCount, regex handlers
  const handleChange = (key, value) => {
    console.log('BlockPopover: handleChange: ', key, value)
    if (bookLayoutStore.updateBlock && line[key] !== value) {
      bookLayoutStore.updateBlock(key, value, page, col, block)
    }
  }

  return (
    <Popover
      containerStyle={{
        zIndex: 9999,
        overflow: `visible`,
        paddingRight: `2px`,
      }}
      position={`top`}
      isOpen={isPopoverOpen}
      onClickOutside={closePopover}
      content={({ position, childRect, targetRect, popoverRect }) => (
        <ArrowContainer
          position={position}
          childRect={childRect}
          targetRect={targetRect}
          popoverRect={popoverRect}
          arrowColor={`#000`}
          arrowSize={16}
        >
          <PopoverInner>
            <SimpleGrid columns={3}>
              <Box>
                <Text color={'red'} fontSize={'md'}>
                  Edit block
                </Text>
              </Box>
              <Box>
                <Text fontSize={'sm'}>Font size</Text>
                <NumericInput
                  onChange={(value) => handleChange('fontSize', value)}
                  value={line.fontSize}
                  // formatter={pointFormat}
                  step={5}
                  min={0}
                  style={{
                    wrap: {
                      display: `block`,
                      marginBottom: `0.5rem`,
                    },
                    input: {
                      fontSize: `24px`,
                      width: `100%`,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text fontSize={'sm'}>Top offset</Text>
                <NumericInput
                  onChange={(value) => handleChange('lineHeight', value)}
                  value={line.lineHeight}
                  format={pointFormat}
                  step={1}
                  style={{
                    wrap: {
                      display: `block`,
                      marginBottom: `0.5rem`,
                    },
                    input: {
                      fontSize: `24px`,
                      width: `100%`,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text fontSize={'sm'}>Word count</Text>
                <NumericInput
                  disabled={line.isParagraph}
                  onChange={(value) => handleChange('wordCount', value)}
                  value={line.wordCount}
                  step={1}
                  min={1}
                  max={10}
                  style={{
                    wrap: {
                      display: `block`,
                      marginBottom: `0.5rem`,
                    },
                    input: {
                      fontSize: `24px`,
                      width: `100%`,
                    },
                  }}
                />
              </Box>
              <Box>
                <Text fontSize={'sm'}>Line count</Text>
                <NumericInput
                  onChange={(value) => handleChange('lineCount', value)}
                  value={line.lineCount}
                  step={1}
                  min={1}
                  style={{
                    wrap: {
                      display: `block`,
                      marginBottom: `0.5rem`,
                    },
                    input: {
                      fontSize: `24px`,
                      width: `100%`,
                    },
                  }}
                />
              </Box>
              <Box>
                <Box md />
                <Box>
                  <Select
                    options={[
                      {
                        value: 'uppercase',
                        label: 'Uppercase',
                      },
                      {
                        value: 'lowercase',
                        label: 'Lowercase',
                      },
                      {
                        value: 'sentence',
                        label: 'Sentence',
                      },
                      {
                        value: 'capitalize',
                        label: 'Capitalize',
                      },
                      {
                        value: 'numbers',
                        label: 'Numbers',
                      },
                      {
                        value: 'all',
                        label: 'All',
                      },
                    ]}
                    value={line.regex || 'all'}
                    name="regex"
                    placeholder="Filters"
                    onChange={(option) => handleChange('regex', option.value)}
                  />
                  <Text fontSize={'sm'}>Additional options</Text>
                  <Checkbox
                    isChecked={line.isParagraph}
                    onChange={(e) =>
                      handleChange('isParagraph', e.target.checked)
                    }
                  >
                    {'Paragraph mode'}
                  </Checkbox>
                  <Checkbox
                    isChecked={line.noSpace}
                    onChange={(e) => handleChange('noSpace', e.target.checked)}
                  >
                    {'No spaces'}
                  </Checkbox>
                  <Checkbox
                    isChecked={line.noGibberish}
                    onChange={(e) =>
                      handleChange('noGibberish', e.target.checked)
                    }
                  >
                    {'No gibberish'}
                  </Checkbox>
                </Box>
                <Box>
                  <Button
                    actionType="secondary"
                    isFullWidth
                    onClick={() =>
                      props.fetchMore({
                        variables: {
                          first: null,
                          after: null,
                          last: null,
                          before: null,
                        },
                        updateQuery: (previousResult, { fetchMoreResult }) => {
                          props.setWord(fetchMoreResult.bookItem.entry)
                        },
                      })
                    }
                  >
                    <Text fontSize={'sm'}>Refresh</Text>
                  </Button>
                </Box>
                <Box>
                  <Button
                    actionType="secondary"
                    isFullWidth
                    onClick={() =>
                      bookLayoutStore.removeBlock(page, col, block)
                    }
                  >
                    <Text fontSize={'sm'}>Remove Block</Text>
                  </Button>
                </Box>
              </Box>
            </SimpleGrid>
          </PopoverInner>
        </ArrowContainer>
      )}
    >
      <PopoverContent onClick={openPopover}>{props.children}</PopoverContent>
    </Popover>
  )
}

/*
BlockPopover.propTypes = {
  entry: PropTypes.string,
  isLoadingBookItem: PropTypes.bool,
  line: PropTypes.object,
  fetchMore: PropTypes.function,
  setWord: PropTypes.function,
  update: PropTypes.object,
  variables: PropTypes.object,
}
*/

export default BlockPopover
