// src/components/DisableDraftMode.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function DisableDraftMode() {
  const [isPreview, setIsPreview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check draft mode status via a simple fetch
    const checkDraft = async () => {
      const res = await fetch('/api/draft/status')
      const data = await res.json()
      setIsPreview(data.isEnabled)
    }
    checkDraft()
  }, [])

  const exitPreview = async () => {
    await fetch('/api/draft-mode/disable', { method: 'POST' })
    router.refresh()
  }

  if (!isPreview) return null

  return (
    <a
      // onClick={exitPreview}
      href="/api/draft-mode/disable"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        padding: '0.5rem',
        margin: '1rem',
        background: '#eee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '10px',
      }}
    >
      Disable Draft Mode
    </a>
  )
}
