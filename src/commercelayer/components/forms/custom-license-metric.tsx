import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Text } from '@chakra-ui/react'

export default function CustomLicenseMetricDialog({
  open,
  setOpen,
  title,
  body,
}: {
  title?: string
  body?: string
  open: boolean
  setOpen: (boolean: boolean) => void
}) {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open)
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
            {title || 'Get in touch'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody p={0} pt={2}>
          <Text textStyle={'sm'}>
            {body ||
              'For this license please get in touch with us info@ortype.is'}
          </Text>
        </DialogBody>
        <DialogFooter gap={2} p={0} pt={2}>
          <Button
            onClick={handleClose}
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
