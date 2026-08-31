'use client'

import dynamic from 'next/dynamic'

const Studio = dynamic(
  () => import('@/sanity/presentation/studio').then((mod) => mod.Studio),
  {
    ssr: false,
  }
)

export function StudioWrapper() {
  return <Studio />
}
