import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'
import NumericInput from 'components/composite/Book/NumericInput'
import { BookContext } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useContext, useState } from 'react'

import {
  CopyIcon,
  EllipsisVerticalIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  TrashIcon,
} from '@sanity/icons'

const ColumnPopover = observer(({ width, blocks, update, ...props }) => {
  const { page, col } = update
  const bookLayoutStore = useContext(BookContext)

  const handleChange = (key, value) => {
    if (bookLayoutStore.updateColumn && col[key] !== value) {
      bookLayoutStore.updateColumn(key, value, page, col)
    }
  }

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Button
            variant={'ghost'}
            position={'absolute'}
            left={'-2rem'}
            fontSize={'xl'}
            top={'-0.6rem'}
          >
            <EllipsisVerticalIcon />
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            sx={{
              border: `.1rem solid #000`,
              boxShadow: `2px 2px 0px #000`,
              backgroundColor: `#fff`,
              width: `16rem`,
            }}
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              <Text fontSize={'md'} color={'red'}>
                Edit Column
              </Text>
            </PopoverHeader>
            <PopoverBody>
              <VStack spacing={2} alignItems={'start'}>
                <Box>
                  <Text fontSize={'md'}>Width</Text>
                  <NumericInput
                    onChange={(value) => handleChange('width', value)}
                    value={width}
                    step={1}
                    min={20}
                    max={100}
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
                <Button
                  leftIcon={<TrashIcon />}
                  fontSize={'2xl'}
                  variant={'ghost'}
                  onClick={() => bookLayoutStore.removeColumn(page, col)}
                >
                  <Text fontSize={'sm'}>Remove</Text>
                </Button>
                <Button
                  leftIcon={<CopyIcon />}
                  fontSize={'2xl'}
                  variant={'ghost'}
                  onClick={() => bookLayoutStore.duplicateColumn(page, col)}
                >
                  <Text fontSize={'sm'}>Duplicate</Text>
                </Button>
                <Button
                  variant={'ghost'}
                  onClick={() =>
                    bookLayoutStore.addColumn(page, 20, 'before', col)
                  }
                  fontSize={'2xl'}
                  leftIcon={<InsertAboveIcon />}
                >
                  <Text fontSize={'sm'}>Add column before</Text>
                </Button>
                <Button
                  variant={'ghost'}
                  onClick={() =>
                    bookLayoutStore.addColumn(page, 20, 'after', col)
                  }
                  fontSize={'2xl'}
                  leftIcon={<InsertBelowIcon />}
                >
                  <Text fontSize={'sm'}>Add column after</Text>
                </Button>
                {/*<Button
                variant={'outline'}
                onClick={() => bookLayoutStore.uppercaseAll(page, col)}
              >
                <Text fontSize={'sm'}>Uppercase all</Text>
              </Button>*/}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      {props.children}
    </>
  )
})

/*
ColumnPopover.propTypes = {
  blocks: PropTypes.array,
  update: PropTypes.object,
  width: PropTypes.number
};
*/
export default ColumnPopover
