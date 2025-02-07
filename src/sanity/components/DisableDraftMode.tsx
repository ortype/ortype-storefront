// sanity/lib/components/DisableDraftMode.tsx

'use client'

import { useDraftModeEnvironment } from 'next-sanity/hooks'

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment()

  // Only show the disable draft mode button when outside of Presentation Tool
  if (environment !== 'live' && environment !== 'unknown') {
    return null
  }

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 bg-gray-50 px-4 py-2"
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        padding: '0.5rem',
        background: '#eee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      Disable Draft Mode
    </a>
  )
}

/*
// only works if wrapped in chakra provider
'use client'

import { toaster } from '@/components/ui/toaster'
import { Box, Show } from '@chakra-ui/react'
import { useDraftModeEnvironment } from 'next-sanity/hooks'
import { useEffect } from 'react'

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment()
  return (
    <Show
      when={environment === 'live' || environment === 'unknown'}
      fallback={<></>}
    >
      <Box position={'fixed'} w={'100%'} top={0} bg={'#eee'}>
        <a href="/api/draft-mode/disable">Disable Draft Mode</a>
      </Box>
      )
    </Show>
  )
}
*/
