import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
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
import NameForm from 'components/composite/Book/NameForm'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { regexOptions } from 'components/data/BookProvider/bookDefaults'
import StyledSelect from 'components/ui/Select'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import React from 'react'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
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
      <Popover>
        <PopoverTrigger>
          <IconButton
            variant={'outline'}
            icon={<CogIcon width={'1.5rem'} height={'1.5rem'} />}
          />
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
            <PopoverCloseButton />
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
                  isChecked={bookLayoutStore.isTemplate}
                  onChange={(e) => handleIsTemplateChange(e.target.checked)}
                >
                  {'Is template'}
                </Checkbox>
                <VStack spacing={2} alignItems={'start'} width={'100%'}>
                  <Divider />
                  <Text fontSize={'sm'}>Pages</Text>
                  <ButtonGroup spacing={2} width={'100%'}>
                    <Menu>
                      <MenuButton
                        // width={'50%'}
                        as={Button}
                        variant={'outline'}
                        leftIcon={
                          <CopyIcon width={'1.5rem'} height={'1.5rem'} />
                        }
                      >
                        <Text fontSize={'sm'}>{'Duplicate'}</Text>
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          icon={
                            <ArrowRightIcon
                              width={'1.5rem'}
                              height={'1.5rem'}
                            />
                          }
                          onClick={() => handleDuplicate('verso', 'recto')}
                        >
                          <Text fontSize={'sm'}>{`Copy verso to right`}</Text>
                        </MenuItem>
                        <MenuItem
                          icon={
                            <ArrowLeftIcon width={'1.5rem'} height={'1.5rem'} />
                          }
                          onClick={() => handleDuplicate('recto', 'verso')}
                        >
                          <Text fontSize={'sm'}>{`Copy recto to verso`}</Text>
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    <Button
                      // width={'50%'}
                      variant={'outline'}
                      leftIcon={
                        <TransferIcon width={'1.5rem'} height={'1.5rem'} />
                      }
                      onClick={handleSwap}
                    >
                      {'Swap'}
                    </Button>
                  </ButtonGroup>
                  <Divider />
                  <Box mt={2}>
                    <Text fontSize={'sm'}>{`Select ${bookLayoutStore.fontFamily.label} style (global)`}</Text>
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
      </Popover>
    </>
  )
}

export default observer(Config)
