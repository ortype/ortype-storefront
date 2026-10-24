'use client'
import { useBuyDialogVisibility } from '@/components/global/buy-dialog-visibility'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef, type ReactNode } from 'react'

// Matches the same `/buy` route shape BuyDialog itself checks for
// (e.g. `/cart/buy`, `/fonts/[slug]/buy`, with or without a locale
// prefix).
const BUY_ROUTE_PATTERN = /\/buy(\/|$)/

interface PageContentProps {
  children: ReactNode
}

// The `@buy` parallel-route slot renders BuyDialog as a full-viewport,
// opaque modal on top of whatever page `children` is (see
// `src/app/(frontend)/[locale]/layout.tsx`, which renders `{children}`
// and `{buy}` side by side, unconditionally). That page was previously
// left fully mounted underneath while completely covered - so every
// window resize forced the browser to recalculate style/layout for BOTH
// the dialog's content AND the hidden page underneath at the same time
// (see e.g. the `/cart` + `/cart/buy` case, where both trees are large).
//
// This used to unmount `children` outright, which removed the page from
// the DOM/CSSOM but also tore down and remounted the whole tree on every
// dialog open/close - visible flash, refetched data, lost scroll
// position. Toggling `display: none` instead keeps `children` mounted
// (no remount, no refetch, no flash) while still pulling it out of
// layout/paint entirely for as long as the dialog covers it - a
// `display: none` subtree isn't laid out or painted, so it can't
// compound the dialog's own resize cost. `display: contents` when
// visible makes the wrapper itself produce no box, so it doesn't affect
// the page's layout at all in the normal (dialog-closed) case.
export function PageContent({ children }: PageContentProps) {
  const pathname = usePathname()
  const isBuyDialogOpen = BUY_ROUTE_PATTERN.test(pathname)
  const { hasFinishedEntering } = useBuyDialogVisibility()
  // Keep the page painted during entry, and restore it before exit starts.
  const hidePage = isBuyDialogOpen && hasFinishedEntering

  // `display: none` collapses this subtree's height to 0, which clamps
  // `window.scrollY` to the page's new (usually 0) scrollable range - so
  // the underlying page's scroll position is lost the moment it's
  // hidden, before we'd get a chance to read it. Track scroll only while
  // the buy route is closed, not merely while the page is visible: entry
  // focus/scroll-lock changes must not overwrite the pre-dialog offset.
  const savedScrollY = useRef(0)

  // Restore it synchronously (before paint) the instant the page becomes
  // visible again, including a close that interrupts the entry animation.
  // This must run before scroll tracking resumes.
  const wasHiddenRef = useRef(hidePage)
  const wasOpenRef = useRef(isBuyDialogOpen)
  useLayoutEffect(() => {
    if (
      (wasHiddenRef.current && !hidePage) ||
      (wasOpenRef.current && !isBuyDialogOpen)
    ) {
      window.scrollTo({
        top: savedScrollY.current,
        left: 0,
        behavior: 'instant',
      })
    }
    wasHiddenRef.current = hidePage
    wasOpenRef.current = isBuyDialogOpen
  }, [hidePage, isBuyDialogOpen])

  useLayoutEffect(() => {
    if (isBuyDialogOpen) return
    const handleScroll = () => {
      savedScrollY.current = window.scrollY
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isBuyDialogOpen])

  return (
    <div style={{ display: hidePage ? 'none' : 'contents' }}>{children}</div>
  )
}

export default PageContent
