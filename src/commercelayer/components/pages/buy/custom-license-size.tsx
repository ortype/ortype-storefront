import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Box, Button, Text, VStack } from '@chakra-ui/react'

export default function CustomLicenseSizeDialog({
  open,
  setOpen,
}: {
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
      size={'full'}
      motionPreset={'slide-in-bottom-custom'}
    >
      <DialogContent borderRadius={0} bg={'colorPalette.bg'} h={'100vh'}>
        <DialogHeader maxW={'50rem'} m={'0 auto'}>
          <DialogTitle
            textAlign={'center'}
            fontSize={'2rem'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
            mx={'auto'}
            pb={4}
          >
            {'50+ employees?'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody maxW={'50rem'} m={'0 auto'} overflow={'auto'}>
          <VStack gap={8}>
            <Text textStyle={'lg'}>
              {
                'Tell us about your use-case in this handy form that we have not created yet'
              }
            </Text>
            <Button
              onClick={handleClose}
              variant={'outline'}
              bg={'white'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
            >
              {'Never mind'}
            </Button>
          </VStack>
        </DialogBody>
        <Box gap={0} position={'absolute'} top={3} left={3}>
          <DialogCloseTrigger
            position={'relative'}
            top={'auto'}
            right={'auto'}
            onClick={handleClose}
          />
        </Box>
      </DialogContent>
    </DialogRoot>
  )
}
