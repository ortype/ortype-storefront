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
      size={'xs'}
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
        // bg={'colorPalette.bg'}
        boxShadow={'lg'}
        bg={'#FFF8D3'}
        borderRadius={20}
        px={4}
        py={5}
      >
        <DialogHeader p={0} pb={2} borderBottom={'1px solid #CEC9AB'}>
          <DialogTitle
            fontSize={'2xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {'Update cart pricing?'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody p={0} pt={2}>
          <Text textStyle={'sm'}>
            {
              'Changing the company size updates pricing for every item in your cart. Continue?'
            }
          </Text>
        </DialogBody>
        <DialogFooter gap={2} p={0} pt={2}>
          <Button
            onClick={onCancel}
            variant="text"
            size="xs"
            fontSize="xs"
            px={2}
            py={1}
            h="auto"
            minH="auto"
          >
            {'Cancel'}
          </Button>
          <Button
            onClick={onConfirm}
            variant={'solid'}
            bg={'black'}
            color={'white'}
            borderRadius={'5rem'}
            border={'2px solid #000'}
            size={'sm'}
            fontSize={'md'}
            _hover={{ bg: 'transparent', color: 'colorPalette.fg' }}
          >
            {'Ok'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
