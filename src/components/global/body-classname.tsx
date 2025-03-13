'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function BodyClassname() {
  const pathname = usePathname()

  let className = 'bg-white'
  if (pathname === '/poem') {
    className = 'bg-black'
  }

  useEffect(() => {
    document.body.className = `body ${className}`
  }, [pathname])

  return null
}
