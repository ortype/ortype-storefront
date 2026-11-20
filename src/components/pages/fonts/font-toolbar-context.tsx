'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

type ToolbarRegistry = {
  owner?: string
  register: (id: string, element: HTMLElement) => () => void
}

const FontToolbarContext = createContext<ToolbarRegistry | null>(null)

export function FontToolbarProvider({ children }: { children: ReactNode }) {
  const targets = useRef(new Map<string, HTMLElement>())
  const [owner, setOwner] = useState<string>()
  const scheduleRef = useRef<() => void>(() => {})
  const register = useCallback((id: string, element: HTMLElement) => {
    targets.current.set(id, element)
    scheduleRef.current()
    return () => {
      targets.current.delete(id)
      scheduleRef.current()
    }
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const height = window.visualViewport?.height ?? window.innerHeight
      const top = window.visualViewport?.offsetTop ?? 0
      let closest: string | undefined
      let distance = Infinity
      for (const [id, element] of targets.current) {
        const rect = element.getBoundingClientRect()
        // A single ownership decision prevents overlapping fixed toolbars,
        // including for modules that have no authored navigation marker.
        if (
          rect.bottom <= top + height * 0.2 ||
          rect.top >= top + height * 0.8
        ) {
          continue
        }
        const nextDistance = Math.abs(
          (rect.top + rect.bottom) / 2 - top - height / 2
        )
        if (nextDistance < distance) {
          closest = id
          distance = nextDistance
        }
      }
      setOwner(closest)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    scheduleRef.current = schedule
    const onFocus = (event: FocusEvent) => {
      for (const [id, element] of targets.current) {
        if (event.target instanceof Node && element.contains(event.target)) {
          setOwner(id)
          return
        }
      }
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('scroll', schedule)
    document.addEventListener('focusin', onFocus)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      scheduleRef.current = () => {}
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('scroll', schedule)
      document.removeEventListener('focusin', onFocus)
    }
  }, [])

  const value = useMemo(() => ({ owner, register }), [owner, register])
  return (
    <FontToolbarContext.Provider value={value}>
      {children}
    </FontToolbarContext.Provider>
  )
}

export function useFontToolbarOwner(ref: RefObject<HTMLElement | null>) {
  const context = useContext(FontToolbarContext)
  const id = useId()
  const register = context?.register
  useEffect(() => {
    if (ref.current && register) return register(id, ref.current)
  }, [id, ref, register])
  return context?.owner === id
}
