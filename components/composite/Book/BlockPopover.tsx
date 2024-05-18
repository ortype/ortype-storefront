import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import NumericInput from 'components/composite/Book/NumericInput'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { regexOptions } from 'components/data/BookProvider/bookDefaults'
import StyledSelect from 'components/ui/Select'
import { toJS } from 'mobx'
import React, { useState } from 'react'
import Select from 'react-select'

import { EditIcon, RefreshIcon, TrashIcon } from '@sanity/icons'
import { type BlockStyle, type LineParams, type Update } from './bookTypes'

const pointFormat = (num) => `${num}pt`

const BlockPopover: React.FC<{
  line: LineParams
  isLoadingBookItem: boolean
  update: Update
  fetchMore: any // @TODO: types
  setWord: any // @TODO: types
  children: any // @TODO: types
  // setWord: React.Dispatch<React.SetStateAction<Word>
}> = ({
  line,
  update: { page, col, block },
  fetchMore,
  setWord,
  isLoadingBookItem,
  children,
}) => {
  const bookLayoutStore = useBookLayoutStore()

  // fontSize, lineHeight, wordCount, lineCount, regex handlers
  const handleChange = (key, value) => {
    console.log('BlockPopover: handleChange: ', key, value)
    if (bookLayoutStore.updateBlock && line[key] !== value) {
      bookLayoutStore.updateBlock(key, value, page, col, block)
    }
  }

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Button
            className={'configBlockButton'}
            variant={'ghost'}
            _hover={{ backgroundColor: 'transparent' }}
            position={'absolute'}
            fontSize={'2xl'}
            top={0}
            left={0}
            right={0}
            height={'100%'}
            bottom={0}
            zIndex={1}
            visibility={'hidden'}
          >
            {/*<EditIcon />*/}
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            sx={{
              border: `.1rem solid #000`,
              boxShadow: `2px 2px 0px #000`,
              backgroundColor: `#fff`,
              width: `18rem`,
            }}
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              <Text fontSize={'md'} color={'red'}>
                Edit Block
              </Text>
            </PopoverHeader>
            <PopoverBody>
              <Text fontSize={'sm'}>{bookLayoutStore.fontFamily?.label}</Text>
              <StyledSelect
                placeholder="Select style"
                options={
                  bookLayoutStore.variantOptions &&
                  bookLayoutStore.variantOptions.constructor === Array
                    ? toJS(bookLayoutStore.variantOptions)
                    : []
                }
                defaultValue={bookLayoutStore.variantOption}
                value={bookLayoutStore.variantOptions.find(
                  ({ value }) => line.variantId === value
                )}
                name="variant"
                onChange={(option) =>
                  handleChange('variantId', option?.value || null)
                }
                width={'16rem'}
                isClearable
              />
              <SimpleGrid columns={3} spacing={3}>
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
                  <Text fontSize={'sm'}>Line gap (↕)</Text>
                  <NumericInput
                    onChange={(value) => handleChange('lineGap', value)}
                    value={line.lineGap}
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
                  <Text fontSize={'sm'}>Offset (↓)</Text>
                  <NumericInput
                    onChange={(value) => handleChange('marginBottom', value)}
                    value={line.marginBottom}
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
              </SimpleGrid>
              <Stack my={4} direction={'column'} spacing="2">
                <Box>
                  <Text fontSize={'sm'}>Typecase</Text>
                  <StyledSelect
                    width={'16rem'}
                    options={regexOptions}
                    name="regex"
                    value={regexOptions.find(
                      (option) => option.value === line.regex
                    )}
                    defaultValue={regexOptions.find(
                      (option) => option.value === 'uppercase'
                    )}
                    // placeholder={line.regex.charAt(0).toUpperCase() + line.regex.slice(1)}
                    placeholder={'Select typecase'}
                    onChange={(option) => handleChange('regex', option.value)}
                  />
                </Box>
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
              </Stack>
              <Divider />
              <ButtonGroup mt={2} variant="outline" spacing="2" width={'100%'}>
                <Button
                  width={'50%'}
                  onClick={() =>
                    fetchMore({
                      variables: {
                        first: null,
                        after: null,
                        last: null,
                        before: null,
                      },
                      updateQuery: (previousResult, { fetchMoreResult }) => {
                        setWord(fetchMoreResult.bookItem.entry)
                      },
                    })
                  }
                  leftIcon={<RefreshIcon width={'1.5rem'} height={'1.5rem'} />}
                >
                  <Text fontSize={'sm'}>Refresh</Text>
                </Button>

                <Button
                  width={'50%'}
                  onClick={() => bookLayoutStore.removeBlock(page, col, block)}
                  leftIcon={<TrashIcon width={'1.5rem'} height={'1.5rem'} />}
                >
                  <Text fontSize={'sm'}>Remove</Text>
                </Button>
              </ButtonGroup>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      {children}
    </>
  )
}

export default BlockPopover
