'use client'

import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { toaster } from '@/components/ui/toaster'
import {
  Button,
  Clipboard,
  Code,
  Dialog,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'

export interface ShareCartDialogProps {
  open: boolean
  /** The share link to display / copy / send */
  url?: string
  onClose: () => void
}

const SHARE_TITLE = 'My Or Type cart'
const SHARE_TEXT = 'Here is my cart from Or Type:'

export default function ShareCartDialog({
  open,
  url,
  onClose,
}: ShareCartDialogProps) {
  const handleSend = async () => {
    if (!url) return

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url })
      } catch (error) {
        // The user dismissing the share sheet is not an error
        if (error instanceof Error && error.name === 'AbortError') return
        toaster.create({
          type: 'error',
          title: 'Could not open the share sheet',
          description: 'Copy the link and send it manually instead.',
        })
      }
      return
    }

    // No Web Share API (most desktop browsers): fall back to the mail client
    window.location.href = `mailto:?subject=${encodeURIComponent(
      SHARE_TITLE
    )}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${url}`)}`
  }

  return (
    <DialogRoot
      lazyMount
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose()
      }}
      size={'md'}
      placement={'center'}
      motionPreset={'slide-in-bottom'}
    >
      <DialogContent
        backdrop={false}
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
            {'Share your cart with someone'}
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
        <DialogBody p={0} pt={3}>
          <HStack gap={2} w={'full'}>
            <Code
              flex={'1 1 0'}
              minW={0}
              px={3}
              py={2}
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              whiteSpace={'nowrap'}
              title={url}
            >
              {url}
            </Code>
            <Clipboard.Root value={url ?? ''} timeout={1500}>
              <Clipboard.Trigger asChild>
                <IconButton
                  aria-label={'Copy link'}
                  variant={'outline'}
                  bg={'white'}
                  borderRadius={'full'}
                  size={'sm'}
                  disabled={!url}
                >
                  <Clipboard.Indicator />
                </IconButton>
              </Clipboard.Trigger>
            </Clipboard.Root>
            <Button
              onClick={handleSend}
              disabled={!url}
              variant={'solid'}
              bg={'black'}
              color={'white'}
              borderRadius={'5rem'}
              border={'2px solid #000'}
              size={'sm'}
              fontSize={'md'}
              flexShrink={0}
              _hover={{
                bg: 'transparent',
                color: 'colorPalette.fg',
              }}
            >
              {'Send Email'}
            </Button>
          </HStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}
