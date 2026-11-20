import type { ReactNode } from 'react'
import '@/components/book/book-page.module.css'
import '@/sanity/components/book-spread-thumbnail.module.css'
import '@/sanity/components/book-reference-input.module.css'
import '@/sanity/components/book-snapshot-input.module.css'
import '@/sanity/components/book-preview-media.module.css'

// Webpack Fast Refresh can unload CSS owned only by next/dynamic children.
// Keep these styles in the persistent Studio route chunk instead. They remain
// CSS Modules: loading them eagerly does not introduce global Studio resets.
export default function StudioLayout({ children }: { children: ReactNode }) {
  return children
}
