import {
  Box,
  Button,
  Group,
  IconButton,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu'

import NameForm from '@/components/composite/Book/NameForm'
import { useBookLayoutStore } from '@/components/data/BookProvider'
import { regexOptions } from '@/components/data/BookProvider/bookDefaults'
import StyledSelect from '@/components/ui/Select'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { CloseButton } from '@/components/ui/close-button'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CogIcon,
  CopyIcon,
  TransferIcon,
} from '@sanity/icons'

const Config = () => {
  const bookLayoutStore = useBookLayoutStore()

  const handleIsTemplateChange = (value) => {
    bookLayoutStore.setIsTemplate(value)
  }

  const handleFilterAllChange = (option) => {
    bookLayoutStore.filterAll(bookLayoutStore.spread, option.value)
  }

  const handleDuplicate = (source, target) => {
    bookLayoutStore.duplicatePage(source, target)
  }

  const handleSwap = () => {
    bookLayoutStore.swapPages(bookLayoutStore.spread)
  }

  return (
    <>
      <PopoverRoot>
        <PopoverTrigger>
          <IconButton variant={'outline'}>
            <CogIcon width={'1.5rem'} height={'1.5rem'} />
          </IconButton>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            sx={{
              border: `.1rem solid #000`,
              boxShadow: `2px 2px 0px #000`,
              backgroundColor: `#fff`,
              width: `20rem`,
            }}
          >
            <PopoverArrow />
            <PopoverHeader>
              <Text fontSize={'md'} color={'red'}>
                Layout options
              </Text>
            </PopoverHeader>
            <PopoverBody>
              <VStack spacing={1} alignItems={'start'}>
                <NameForm
                  bookLayoutId={bookLayoutStore.layoutOption.value}
                  name={bookLayoutStore.layoutOption.label}
                />
                <Checkbox
                  // @TODO: `useCheckbox` for customized look/feel
                  checked={bookLayoutStore.isTemplate}
                  onCheckedChange={(e) => handleIsTemplateChange(e.checked)}
                >
                  {'Is template'}
                </Checkbox>
                <VStack spacing={2} alignItems={'start'} width={'100%'}>
                  <Text fontSize={'sm'}>Pages</Text>
                  <Group spacing={2} width={'100%'}>
                    <MenuRoot
                      variant={'right'}
                      positioning={{ placement: 'right-start' }}
                    >
                      <MenuTrigger
                        // width={'50%'}
                        as={Button}
                        variant={'outline'}
                        leftIcon={
                          <CopyIcon width={'1.5rem'} height={'1.5rem'} />
                        }
                      >
                        <Text fontSize={'sm'}>{'Duplicate'}</Text>
                      </MenuTrigger>
                      <MenuContent portalled={false}>
                        <MenuItem
                          icon={
                            <ArrowRightIcon
                              width={'1.5rem'}
                              height={'1.5rem'}
                            />
                          }
                          onClick={() => handleDuplicate('verso', 'recto')}
                        >
                          <Text fontSize={'sm'}>{`Copy verso to recto`}</Text>
                        </MenuItem>
                        <MenuItem
                          icon={
                            <ArrowLeftIcon width={'1.5rem'} height={'1.5rem'} />
                          }
                          onClick={() => handleDuplicate('recto', 'verso')}
                        >
                          <Text fontSize={'sm'}>{`Copy recto to verso`}</Text>
                        </MenuItem>
                      </MenuContent>
                    </MenuRoot>
                    <Button
                      // width={'50%'}
                      variant={'outline'}
                      onClick={handleSwap}
                    >
                      <TransferIcon width={'1.5rem'} height={'1.5rem'} />{' '}
                      {'Swap'}
                    </Button>
                  </Group>
                  <Box mt={2}>
                    <Text
                      fontSize={'sm'}
                    >{`Select ${bookLayoutStore.fontFamily.label} style (global)`}</Text>
                    <StyledSelect
                      placeholder="Select style"
                      options={
                        bookLayoutStore.variantOptions &&
                        bookLayoutStore.variantOptions.constructor === Array
                          ? toJS(bookLayoutStore.variantOptions)
                          : []
                      }
                      value={bookLayoutStore.variantOption}
                      name="variant"
                      onChange={bookLayoutStore.setVariantOption}
                    />
                  </Box>
                  <Box mt={2}>
                    <Text fontSize={'sm'}>{'Typecase (global)'}</Text>
                    <StyledSelect
                      width={'18rem'}
                      options={regexOptions}
                      name="regex"
                      value={regexOptions?.find(
                        (option) => option.value === bookLayoutStore.regex
                      )}
                      placeholder={'Select typecase'}
                      onChange={handleFilterAllChange}
                    />
                  </Box>
                </VStack>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </PopoverRoot>
    </>
  )
}

export default observer(Config)
