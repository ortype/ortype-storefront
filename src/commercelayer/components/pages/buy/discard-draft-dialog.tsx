import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { BuyFontsQueryResult } from '@/types'
import { Button, Dialog, Spinner, Text } from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'

export interface DiscardDraftDialogProps {
  open: boolean
  /** The draft can be written to the cart; hides the save button when false */
  canSave: boolean
  /** The save is in flight: buttons are disabled and dismissal is ignored */
  isSaving?: boolean
  /** This font has committed line items in the cart */
  isCommitted: boolean
  error?: string
  /** Drop the draft and continue with the interrupted action */
  onDiscard: () => void
  /** Save the draft to the cart, then continue with the interrupted action */
  onSave: () => void
  /** Stay where you are (Esc / backdrop); the interrupted action is dropped */
  onDismiss: () => void
  font: BuyFontsQueryResult['font']
}

export default function DiscardDraftDialog({
  open,
  canSave,
  isSaving = false,
  isCommitted,
  error,
  onDiscard,
  onSave,
  onDismiss,
  font,
}: DiscardDraftDialogProps) {
  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        // Esc / backdrop is "stay", never "discard". Ignored mid-save.
        if (!e.open && !isSaving) onDismiss()
      }}
      size={'xs'}
      placement={'center'}
      motionPreset={'slide-in-bottom'}
      role={'alertdialog'}
    >
      {/* portalled={false} nests this dialog inside the parent (e.g. BuyDialog)
          DOM subtree, so pressing a button isn't treated as an "interact
          outside" that would dismiss the parent dialog. */}
      <DialogContent
        backdrop={true}
        portalled={false}
        boxShadow={'lg'}
        bg={'#F8F8F8'}
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
            {'Oops!'}
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
            {`You have unsaved changes to ${font?.shortName}! To proceed please save or discard them.`}
          </Text>
          {error && (
            <Text textStyle={'sm'} color={'red'} mt={2} role={'alert'}>
              {error}
            </Text>
          )}
        </DialogBody>
        <DialogFooter gap={2} p={0} pt={2}>
          <Button
            onClick={onDiscard}
            disabled={isSaving}
            variant='text'
            size='xs'
            fontSize='xs'
            px={2}
            py={1}
            h='auto'
            minH='auto'
          >
            {'Discard & proceed'}
          </Button>
          {canSave && (
            <Button
              onClick={onSave}
              disabled={isSaving}
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
            >
              {isSaving ? (
                <>
                  <Spinner size={'xs'} /> {'Processing...'}
                </>
              ) : !isCommitted ? (
                'Add to cart & proceed'
              ) : (
                'Update cart & proceed'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}
