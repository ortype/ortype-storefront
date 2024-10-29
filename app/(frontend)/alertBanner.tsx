'use client'
import { Box, Button, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useSyncExternalStore, useTransition } from 'react'

import { disableDraftMode } from '@/app/actions'

const emptySubscribe = () => () => {}

export default function AlertBanner() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const shouldShow = useSyncExternalStore(
    emptySubscribe,
    () => window.top === window,
    () => false
  )

  if (!shouldShow) return null

  return (
    <Box
      pos={'fixed'}
      top={0}
      left={0}
      bg={'#eee'}
      w={'100%'}
      className={`${pending ? 'animate-pulse' : ''}`}
    >
      <Box
        textAlign={'center'}
        py={'0.25rem'}
        className="py-2 text-center text-sm"
      >
        {pending ? (
          'Disabling draft mode...'
        ) : (
          <>
            <Text fontSize={'sm'} as={'span'}>
              {'Previewing drafts. '}
            </Text>
            <Button
              variant={'outline'}
              size={'xs'}
              onClick={() =>
                startTransition(() =>
                  disableDraftMode().then(() => {
                    router.refresh()
                  })
                )
              }
              className="hover:text-cyan underline transition-colors duration-200"
            >
              Back to published
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
