'use client'
// src/components/composite/Tester/use-tester-scale-transition.ts
import { useCallback, useRef } from 'react'

// Fakes a smooth font-size/line-height transition using `transform`
// (compositor-only) instead of animating font-size/line-height
// directly. Profiling showed the browser can't composite a
// `font-size` animation ("Compositing failed: Unsupported CSS
// property: font-size"), forcing a full Layout+Paint pass on the main
// thread every frame for the whole transition.
//
// This is driven entirely via direct DOM mutation through a ref, NOT
// React state. Routing the animation's "invert -> identity" bookkeeping
// through `useState` would force FontList (and, without memoizing
// every item, its whole subtree) to re-render an extra time purely to
// flip a CSS variable that only the ancestor's own `style` attribute
// needs - competing with the animation for main-thread time on
// exactly the frames it matters most. `--tester-scale-to-table` /
// `--tester-scale-to-list` are static, always-present, responsive CSS
// vars (see TESTER_SCALE_STATIC_VARS) - this hook only ever toggles
// which one `--tester-scale` points to, plus the transition duration,
// directly on the DOM node.
export function useTesterScaleTransition<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  // Must be called synchronously from the same event handler that
  // flips table/list mode (before/alongside `setValue`), so the
  // inverted scale is present in the DOM by the time the real
  // font-size/line-height CSS vars (see getTesterCssVars) commit to
  // their final value - otherwise the item would flash at its final
  // size for a frame before inverting.
  const triggerModeChange = useCallback((nextTable: boolean) => {
    const node = ref.current
    if (!node) return

    const invertVar = nextTable
      ? 'var(--tester-scale-to-table)'
      : 'var(--tester-scale-to-list)'

    // Snap instantly to the inverted scale (no transition).
    node.style.setProperty('--tester-scale-duration', '0s')
    node.style.setProperty('--tester-scale', invertVar)

    // Double rAF: guarantees the browser has painted that inverted,
    // transition-less frame before we animate back to identity -
    // otherwise it can coalesce both writes into the same frame and
    // skip the transition entirely.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        node.style.setProperty('--tester-scale-duration', '0.2s')
        node.style.setProperty('--tester-scale', '1')
      })
    })
  }, [])

  return { ref, triggerModeChange }
}
