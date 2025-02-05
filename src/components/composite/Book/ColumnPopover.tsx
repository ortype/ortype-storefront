import { useBookLayoutStore } from '@/components/data/BookProvider'
import { CloseButton } from '@/components/ui/close-button'
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Box, Button, ButtonGroup, Text, VStack } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite'
import React from 'react'

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
  width: number
}> = observer(({ blocks, update: { page, col }, width }) => {
  const bookLayoutStore = useBookLayoutStore()

  const handleChange = (key, value) => {
    if (bookLayoutStore.updateColumn && col[key] !== value) {
      bookLayoutStore.updateColumn(key, value, page, col)
    }
  }

  return (
    <PopoverRoot
      positioning={{ placement: 'left-start' }}
      lazyMount
      unmountOnExit
    >
      <PopoverTrigger asChild>
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
        css={{
          border: `.1rem solid #000`,
          boxShadow: `2px 2px 0px #000`,
          backgroundColor: `#fff`,
          width: `18rem`,
        }}
      >
        <PopoverArrow />
        <PopoverHeader>
          <Text fontSize={'md'} color={'red'}>
            Edit Column
          </Text>
        </PopoverHeader>
        <PopoverBody>
          <VStack gap={2} alignItems={'start'}>
            <Box w={'100%'}>
              <Text as={'span'} fontSize={'xs'}>
                Width
              </Text>
              <ButtonGroup attached variant={'outline'} width={'100%'}>
                <Button
                  w={'25%'}
                  size={'sm'}
                  onClick={() => handleChange('width', 33.33)}
                >
                  <Text as={'span'} fontSize={'xs'}>
                    {'1/3'}
                  </Text>
                </Button>
                <Button
                  w={'25%'}
                  size={'sm'}
                  onClick={() => handleChange('width', 50)}
                >
                  <Text as={'span'} fontSize={'xs'}>
                    {'1/2'}
                  </Text>
                </Button>
                <Button
                  w={'25%'}
                  size={'sm'}
                  onClick={() => handleChange('width', 66.67)}
                >
                  <Text as={'span'} fontSize={'xs'}>
                    {'2/3'}
                  </Text>
                </Button>
                <Button
                  w={'25%'}
                  size={'sm'}
                  onClick={() => handleChange('width', 100)}
                >
                  <Text as={'span'} fontSize={'xs'}>
                    {'Full'}
                  </Text>
                </Button>
              </ButtonGroup>
            </Box>
            <Box w={'100%'}>
              <Text as={'span'} fontSize={'xs'}>
                Insert Column
              </Text>
              <ButtonGroup attached variant={'outline'} width={'100%'}>
                <Button
                  size={'sm'}
                  w={'50%'}
                  onClick={() =>
                    bookLayoutStore.addColumn(page, 30, 'before', col)
                  }
                  fontSize={'2xl'}
                >
                  <InsertAboveIcon />{' '}
                  <Text as={'span'} fontSize={'xs'}>
                    Before
                  </Text>
                </Button>
                <Button
                  size={'sm'}
                  w={'50%'}
                  onClick={() =>
                    bookLayoutStore.addColumn(page, 30, 'after', col)
                  }
                  fontSize={'2xl'}
                  rightIcon={<InsertBelowIcon />}
                >
                  <Text as={'span'} fontSize={'xs'}>
                    After
                  </Text>
                </Button>
              </ButtonGroup>
            </Box>
            <ButtonGroup variant={'outline'} gap="2" width={'100%'}>
              <Button
                width={'50%'}
                fontSize={'2xl'}
                size={'sm'}
                onClick={() =>
                  bookLayoutStore.duplicateColumn(page, width, blocks, col)
                }
              >
                <CopyIcon />{' '}
                <Text as={'span'} fontSize={'xs'}>
                  Duplicate
                </Text>
              </Button>
              <Button
                width={'50%'}
                fontSize={'2xl'}
                size={'sm'}
                onClick={() => bookLayoutStore.removeColumn(page, col)}
              >
                <TrashIcon />
                <Text as={'span'} fontSize={'xs'}>
                  Remove
                </Text>
              </Button>
            </ButtonGroup>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  )
})

export default ColumnPopover
