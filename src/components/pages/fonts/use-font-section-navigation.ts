'use client'

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from 'react'
import type { FontSection } from './font-sections'

export function useFontSectionNavigation(
  sections: readonly Pick<FontSection, 'id'>[],
  contentRef: RefObject<HTMLDivElement | null>
) {
  const [activeId, setActiveId] = useState<string>()
  const preferredId = useRef<string | undefined>(undefined)
  const sectionIds = sections.map((section) => section.id).join('|')

  useEffect(() => {
    const ids = sectionIds ? sectionIds.split('|') : []
    const content = contentRef.current
    if (!content || ids.length === 0) return

    let frame = 0
    let pendingHash = true
    const targets = () =>
      ids.flatMap((id) => {
        const element = document.getElementById(id)
        return element && content.contains(element) ? [element] : []
      })

    const update = () => {
      frame = 0
      const elements = targets()
      // Dimensions load after hydration. Retry the initial fragment when its
      // destination mounts, rather than losing deep links to the placeholder.
      if (pendingHash) {
        const target = elements.find(
          (element) => `#${element.id}` === window.location.hash
        )
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: 'instant' })
          preferredId.current = target.id
          pendingHash = false
        } else if (!ids.some((id) => `#${id}` === window.location.hash)) {
          pendingHash = false
        }
      }

      let active: HTMLElement | undefined
      let row: HTMLElement[] = []
      for (const element of elements) {
        const top = element.getBoundingClientRect().top
        const offset =
          parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0
        if (top <= offset + 2) {
          if (
            !active ||
            Math.abs(top - active.getBoundingClientRect().top) > 2
          ) {
            row = []
          }
          row.push(element)
          active = element
        }
      }

      // The last section may be too short to reach the activation line.
      const last = elements[elements.length - 1]
      if (
        last &&
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2 &&
        last.getBoundingClientRect().top < window.innerHeight
      ) {
        active = last
        row = elements.filter(
          (element) =>
            Math.abs(
              element.getBoundingClientRect().top -
                last.getBoundingClientRect().top
            ) <= 2
        )
      }
      // Two markers can start on the same spread. Keep the explicitly selected
      // one active when their vertical positions are indistinguishable.
      setActiveId(
        row.find((element) => element.id === preferredId.current)?.id ??
          row[0]?.id ??
          active?.id
      )
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    const onHistory = () => {
      pendingHash = true
      schedule()
    }
    const mutationObserver = new MutationObserver(schedule)
    mutationObserver.observe(content, { childList: true, subtree: true })
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(content)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('hashchange', onHistory)
    window.addEventListener('popstate', onHistory)
    schedule()

    return () => {
      window.cancelAnimationFrame(frame)
      mutationObserver.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('hashchange', onHistory)
      window.removeEventListener('popstate', onHistory)
    }
  }, [sectionIds, contentRef])

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const target = document.getElementById(id)
    if (!target || !contentRef.current?.contains(target)) return

    event.preventDefault()
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`)
    }
    preferredId.current = id
    setActiveId(id)
    target.focus({ preventScroll: true })
    target.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }

  return {
    activeId: sections.some((section) => section.id === activeId)
      ? activeId
      : undefined,
    navigate,
  }
}
