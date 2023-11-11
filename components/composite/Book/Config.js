import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import NameForm from 'components/composite/Book/NameForm'
import { useBookLayoutStore } from 'components/data/BookProvider'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { CogIcon, CopyIcon, TransferIcon } from '@sanity/icons'

const Config = () => {
  const bookLayoutStore = useBookLayoutStore()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleIsTemplateChange = (value) => {
    console.log('handleIsTemplateChange: ', value)
    bookLayoutStore.setIsTemplate(value)
  }

  // @TODO: Consider using Popover instead of Modal here...

  return (
    <>
      <IconButton
        variant={'outline'}
        onClick={onOpen}
        icon={<CogIcon width={'1.5rem'} height={'1.5rem'} />}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text fontSize={'lg'}>{'Layout options'}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={1} alignItems={'start'}>
              <NameForm
                bookLayoutId={bookLayoutStore.layoutOption.value}
                name={bookLayoutStore.layoutOption.label}
              />
              <Checkbox
                // @TODO: `useCheckbox` for customized look/feel
                minH={10}
                isChecked={bookLayoutStore.isTemplate}
                onChange={(e) => handleIsTemplateChange(e.target.checked)}
              >
                {'Is template'}
              </Checkbox>
              <ButtonGroup spacing={2}>
                <Button
                  variant={'outline'}
                  leftIcon={<CopyIcon width={'1.5rem'} height={'1.5rem'} />}
                >
                  {'Duplicate page'}
                </Button>
                <Button
                  variant={'outline'}
                  leftIcon={<TransferIcon width={'1.5rem'} height={'1.5rem'} />}
                >
                  {'Reverse pages'}
                </Button>
              </ButtonGroup>
            </VStack>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default observer(Config)
