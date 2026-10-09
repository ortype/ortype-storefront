'use client'

import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog'
import { toaster } from '@/components/ui/toaster'
import { Button, Clipboard, Dialog, HStack, Link } from '@chakra-ui/react'
import { CloseIcon } from '@sanity/icons'

export interface ShareCartDialogProps {
  open: boolean
  /** The share link to display / copy / send */
  url?: string
  setShareOpen: () => void
  onClose: () => void
}

const SHARE_TITLE = 'My Or Type cart'
const SHARE_TEXT = 'Here is my cart from Or Type:'

export default function ShareCartDialog({
  open,
  url,
  setShareOpen,
  onClose,
}: ShareCartDialogProps) {
  const handleClick = () => {
    console.log('handle clipboard click')
    toaster.create({
      type: 'info',
      title: 'Copied',
      description: 'Link copied to your clipboard',
    })
  }

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
      /*onOpenChange={(e) => {
        if (!e.open) onClose()
      }}*/
      onOpenChange={(e) => setShareOpen(e.open)}
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
            <Clipboard.Root
              value={url ?? ''}
              timeout={1500}
              maxW={'100%'}
              minW={'0'}
            >
              <Clipboard.Trigger
                onClick={handleClick}
                display={'flex'}
                flexDirection={'row'}
                maxW={'100%'}
                minW={0}
                asChild
              >
                <Link variant={'plain'} color={'black'}>
                  <Clipboard.Indicator />
                  <Clipboard.ValueText
                    overflow={'hidden'}
                    textOverflow={'ellipsis'}
                    whiteSpace={'nowrap'}
                  />
                </Link>
              </Clipboard.Trigger>
            </Clipboard.Root>
            <Button
              onClick={handleSend}
              disabled={!url}
              variant={'outline'}
              bg={'transparent'}
              borderRadius={'5rem'}
              size={'sm'}
              fontSize={'md'}
              _hover={{
                bg: 'black',
                color: 'white',
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
