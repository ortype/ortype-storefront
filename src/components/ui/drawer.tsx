import { Button, Drawer as ChakraDrawer, Portal } from '@chakra-ui/react'
import { Icon } from '@sanity/icons'
import * as React from 'react'
// import { CloseButton } from './close-button'

interface DrawerContentProps extends ChakraDrawer.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  offset?: ChakraDrawer.ContentProps['padding']
}

export const DrawerCancel = function DrawerCancel({ children, ...rest }) {
  return (
    <Button
      type='button'
      variant='text'
      size='xs'
      fontSize='xs'
      px={2}
      py={1}
      h='auto'
      minH='auto'
      {...rest}
    >
      {children}
    </Button>
  )
}

export const DrawerConfirm = function DrawerConfirm({ children, ...rest }) {
  return (
    <Button
      alignSelf='flex-end'
      variant={'solid'}
      bg={'black'}
      color={'white'}
      borderRadius={'5rem'}
      border={'2px solid #000'}
      size={'sm'}
      fontSize={'md'}
      gap={1}
      _hover={{
        bg: 'transparent',
        color: 'colorPalette.fg',
      }}
      {...rest}
    >
      {children}
    </Button>
  )
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent(props, ref) {
  const {
    children,
    portalled = true,
    portalRef,
    offset = 10,
    ...rest
  } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraDrawer.Positioner padding={offset}>
        <ChakraDrawer.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDrawer.Content>
      </ChakraDrawer.Positioner>
    </Portal>
  )
})

export const DrawerCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraDrawer.CloseTriggerProps
>(function DrawerCloseTrigger(props, ref) {
  return (
    <ChakraDrawer.CloseTrigger
      position='absolute'
      insetEnd={5}
      top={5}
      rounded={'full'}
      cursor={'pointer'}
      _hover={{
        bg: 'colorPalette.bg',
      }}
      {...props}
      ref={ref}
      asChild
    >
      <Icon symbol='close' style={{ fontSize: '2.5rem' }} />
    </ChakraDrawer.CloseTrigger>
  )
})

export const DrawerTrigger = ChakraDrawer.Trigger
export const DrawerRoot = ChakraDrawer.Root
export const DrawerFooter = ChakraDrawer.Footer
export const DrawerHeader = ChakraDrawer.Header
export const DrawerBody = ChakraDrawer.Body
export const DrawerBackdrop = ChakraDrawer.Backdrop
export const DrawerDescription = ChakraDrawer.Description
export const DrawerTitle = ChakraDrawer.Title
export const DrawerActionTrigger = ChakraDrawer.ActionTrigger
