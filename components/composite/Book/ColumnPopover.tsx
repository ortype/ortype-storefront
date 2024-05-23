import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
} from '@chakra-ui/react'
import NumericInput from 'components/composite/Book/NumericInput'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import {
  type BlockParams,
  type BlockStyle,
  type LineParams,
  type Update,
} from './bookTypes'

import {
  CopyIcon,
  EllipsisVerticalIcon,
  InsertAboveIcon,
  InsertBelowIcon,
  TrashIcon,
} from '@sanity/icons'

const ColumnPopover: React.FC<{
  blocks: BlockParams[]
  update: Update
}> = observer(({ blocks, update: { page, col } }) => {
  const bookLayoutStore = useBookLayoutStore()

  const handleChange = (key, value) => {
    if (bookLayoutStore.updateColumn && col[key] !== value) {
      bookLayoutStore.updateColumn(key, value, page, col)
    }
  }

  return (
    <Popover placement={'left-start'}>
      <PopoverTrigger>
        <Button
          variant={'ghost'}
          position={'absolute'}
          left={'-2.5rem'}
          fontSize={'xl'}
          top={'0'}
          px={'0.2rem'}
          borderTopRightRadius={'none'}
          borderBottomRightRadius={'none'}
          _hover={{
            background: '#f1f1f18a',
          }}
        >
          <EllipsisVerticalIcon />
        </Button>
      </PopoverTrigger>
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
            Edit Column
          </Text>
        </PopoverHeader>
        <PopoverBody>
          <VStack spacing={2} alignItems={'start'}>
            <Box>
              <Text fontSize={'sm'}>Width</Text>
              <ButtonGroup isAttached>
                <Button
                  variant={'outline'}
                  onClick={() => handleChange('width', 30)}
                >
                  <Text fontSize={'sm'}>{'30%'}</Text>
                </Button>
                <Button
                  variant={'outline'}
                  onClick={() => handleChange('width', 50)}
                >
                  <Text fontSize={'sm'}>{'50%'}</Text>
                </Button>
                <Button
                  variant={'outline'}
                  onClick={() => handleChange('width', 70)}
                >
                  <Text fontSize={'sm'}>{'70%'}</Text>
                </Button>
                <Button
                  variant={'outline'}
                  onClick={() => handleChange('width', 100)}
                >
                  <Text fontSize={'sm'}>{'100%'}</Text>
                </Button>
              </ButtonGroup>
            </Box>
            <Text fontSize={'sm'}>Insert Column</Text>
            <ButtonGroup isAttached width={'100%'}>
              <Button
                variant={'outline'}
                onClick={() =>
                  bookLayoutStore.addColumn(page, 30, 'before', col)
                }
                fontSize={'2xl'}
                leftIcon={<InsertAboveIcon />}
              >
                <Text fontSize={'sm'}>Before</Text>
              </Button>
              <Button
                variant={'outline'}
                onClick={() =>
                  bookLayoutStore.addColumn(page, 30, 'after', col)
                }
                fontSize={'2xl'}
                rightIcon={<InsertBelowIcon />}
              >
                <Text fontSize={'sm'}>After</Text>
              </Button>
            </ButtonGroup>
            <Divider />
            <ButtonGroup variant="outline" spacing="2" width={'100%'}>
              <Button
                width={'50%'}
                leftIcon={<CopyIcon />}
                fontSize={'2xl'}
                onClick={() =>
                  bookLayoutStore.duplicateColumn(page, width, blocks, col)
                }
              >
                <Text fontSize={'sm'}>Duplicate</Text>
              </Button>
              <Button
                width={'50%'}
                leftIcon={<TrashIcon />}
                fontSize={'2xl'}
                onClick={() => bookLayoutStore.removeColumn(page, col)}
              >
                <Text fontSize={'sm'}>Remove</Text>
              </Button>
            </ButtonGroup>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})

export default ColumnPopover
