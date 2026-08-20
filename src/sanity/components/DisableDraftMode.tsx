// sanity/lib/components/DisableDraftMode.tsx

'use client'

import { useIsPresentationTool } from 'next-sanity/hooks'

export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()

  // Hide the button when inside the Presentation Tool
  if (isPresentationTool) return null

  return (
    <a
      href="/api/draft-mode/disable"
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
