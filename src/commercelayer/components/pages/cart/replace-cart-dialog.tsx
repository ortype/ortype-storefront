import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Dialog, Text } from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'

export interface ReplaceCartDialogProps {
  open: boolean
  /** Number of styles currently in the recipient's cart */
  itemsCount: number
  /** Number of styles in the shared cart */
  sharedItemsCount: number
  /** Replace the cart with the shared one */
  onReplace: () => void
  /** Keep the current cart (Esc / backdrop / close button) */
  onKeep: () => void
}

export default function ReplaceCartDialog({
  open,
  itemsCount,
  sharedItemsCount,
  onReplace,
  onKeep,
}: ReplaceCartDialogProps) {
  const cartHasItemsMsg = `You already have ${itemsCount} ${
    itemsCount === 1 ? 'style' : 'styles'
  } in your cart. Replacing it with the shared cart (${sharedItemsCount} ${
    sharedItemsCount === 1 ? 'style' : 'styles'
  }) will remove your current selections.`

  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        // Esc / backdrop is "keep", never "replace"
        if (!e.open) onKeep()
      }}
      size={'xs'}
      placement={'center'}
      motionPreset={'slide-in-bottom'}
      role={'alertdialog'}
    >
      <DialogContent
        boxShadow={'lg'}
        bg={'#FFF8D3'}
        borderRadius={20}
        px={4}
        py={5}
      >
        <DialogHeader
          p={0}
          justifyContent={'space-between'}
          alignItems={'center'}
          borderBottom={'1px solid #CEC9AB'}
        >
          <DialogTitle
            fontSize={'2xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {'Replace your cart?'}
          </DialogTitle>
          <Dialog.CloseTrigger
            pos={'relative'}
            top={'auto'}
            right={'-0.5rem'}
            asChild
          >
            <CloseIcon width={'2.5rem'} height={'2.5rem'} />
          </Dialog.CloseTrigger>
        </DialogHeader>
        <DialogBody p={0} pt={2}>
          <Text textStyle={'sm'}>
            {`Someone just shared this cart with you. You can now review and edit the content of the cart, checkout and pay.`}
            {itemsCount > 0 && cartHasItemsMsg}
          </Text>
        </DialogBody>
        <DialogFooter gap={2} p={0} pt={2}>
          <Button
            onClick={onReplace}
            variant={'solid'}
            bg={'black'}
            color={'white'}
            borderRadius={'5rem'}
            border={'2px solid #000'}
            size={'sm'}
            fontSize={'md'}
            _hover={{
              bg: 'transparent',
              color: 'colorPalette.fg',
            }}
          >
            {'Open cart'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
