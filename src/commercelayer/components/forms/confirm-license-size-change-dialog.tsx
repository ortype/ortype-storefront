import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Text } from '@chakra-ui/react'

/**
 * Order-wide confirmation shown before applying a license size change when the
 * cart already has committed items. Cancel keeps the current size; Ok applies
 * the new size (pricing reconciles per-font on "Update cart" and at checkout).
 */
export default function ConfirmLicenseSizeChangeDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        // Treat backdrop / escape close as a cancel.
        if (!e.open) onCancel()
      }}
      size={'sm'}
      placement={'center'}
      motionPreset={'slide-in-bottom'}
      role={'alertdialog'}
    >
      {/* portalled={false} nests this dialog inside the parent (e.g. BuyDialog)
          DOM subtree, so pressing Ok/Cancel isn't treated as an "interact
          outside" that would dismiss the parent dialog. */}
      <DialogContent
        backdrop={false}
        portalled={false}
        borderRadius={'l4'}
        bg={'colorPalette.bg'}
        boxShadow={'lg'}
      >
        <DialogHeader>
          <DialogTitle
            fontSize={'2xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {'Update cart pricing?'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text textStyle={'sm'}>
            {
              'Changing the company size updates pricing for every item in your cart. Continue?'
            }
          </Text>
        </DialogBody>
        <DialogFooter gap={2}>
          <Button
            onClick={onCancel}
            variant={'outline'}
            bg={'white'}
            borderRadius={'5rem'}
            size={'sm'}
            fontSize={'md'}
          >
            {'Cancel'}
          </Button>
          <Button
            onClick={onConfirm}
            variant={'solid'}
            bg={'black'}
            color={'white'}
            borderRadius={'5rem'}
            size={'sm'}
            fontSize={'md'}
            _hover={{ bg: 'red' }}
          >
            {'Ok'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
