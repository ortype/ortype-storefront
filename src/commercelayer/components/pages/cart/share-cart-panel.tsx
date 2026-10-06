'use client'
import { toaster } from '@/components/ui/toaster'
import {
  Box,
  Button,
  Clipboard,
  Code,
  CodeBlock,
  Collapsible,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react'

export interface ShareCartPanelProps {
  open: boolean
  /** The share link to display / copy / send */
  url?: string
}

const SHARE_TITLE = 'My Or Type cart'
const SHARE_TEXT = 'Here is my cart from Or Type:'

export default function ShareCartPanel({ open, url }: ShareCartPanelProps) {
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
    <Collapsible.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose()
      }}
    >
      <Collapsible.Content bg={'#FFF8D3'} borderRadius={20} mt={2}>
        <VStack px={4} py={5} gap={2} alignItems={'flex-self'}>
          <Heading
            fontSize={'xl'}
            fontWeight={'normal'}
            textTransform={'uppercase'}
          >
            {'Share your cart'}
          </Heading>
          <HStack
            gap={2}
            py={2}
            w={'full'}
            borderTop={'1px solid #CEC9AB'}
            // borderBottom={'1px solid #CEC9AB'}
          >
            <Code
              colorPalette={'gray'}
              variant='subtle'
              size={'lg'}
              minW={0}
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
                  bg={'transparent'}
                  borderRadius={'full'}
                  size={'sm'}
                  disabled={!url}
                >
                  <Clipboard.Indicator />
                </IconButton>
              </Clipboard.Trigger>
            </Clipboard.Root>
          </HStack>
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
        </VStack>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
