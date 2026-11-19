'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { flushSync } from 'react-dom'

export function useSpecimenTransition(
  gridRef: RefObject<HTMLDivElement | null>,
  layoutKey: string
) {
  const animations = useRef(new Set<Animation>())
  const cancel = useCallback(() => {
    animations.current.forEach((animation) => animation.cancel())
    animations.current.clear()
  }, [])

  useEffect(() => {
    // Resize/breakpoint changes invalidate measured bounds; do not animate them.
    cancel()
    return cancel
  }, [layoutKey, cancel])

  return useCallback(
    (commit: () => void) => {
      const nodes = Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>(
          '[data-specimen-page]'
        ) ?? []
      )
      // Read the current visual bounds before cancelling an interrupted animation.
      const before = nodes.map((node) => node.getBoundingClientRect())
      const anchor = before.reduce(
        (best, rect, index) =>
          rect.bottom > 80 &&
          rect.top < window.innerHeight &&
          (best < 0 ||
            Math.abs(rect.top - 80) < Math.abs(before[best].top - 80))
            ? index
            : best,
        -1
      )
      cancel()
      // Apply final layout AND proportional text metrics once, before measuring.
      // Only page transforms animate; font-size/line-height never tween.
      flushSync(commit)

      // Correct document-flow changes before computing the final FLIP positions.
      // Anchor a page rather than its spread so moving between paired spreads
      // and the tall Pages list preserves the reader's position and page ratio.
      if (anchor >= 0) {
        const delta =
          nodes[anchor].getBoundingClientRect().top - before[anchor].top
        window.scrollBy({ top: delta, behavior: 'instant' })
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        return

      nodes.forEach((node, index) => {
        const from = before[index]
        const to = node.getBoundingClientRect()
        if (!to.width || !to.height) return
        // Offscreen pages need only their final layout, not compositor layers.
        if (
          (from.bottom < 0 || from.top > window.innerHeight) &&
          (to.bottom < 0 || to.top > window.innerHeight)
        )
          return

        // FLIP: invert final geometry back to the previous visual bounds, then
        // let the compositor bring it to identity without per-frame React work.
        const animation = node.animate(
          [
            {
              transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`,
            },
            { transform: 'none' },
          ],
          { duration: 200, easing: 'ease-out' }
        )
        animations.current.add(animation)
        animation.onfinish = () => animations.current.delete(animation)
      })
    },
    [gridRef, cancel]
  )
}
