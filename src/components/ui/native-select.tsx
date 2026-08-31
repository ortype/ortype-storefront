'use client'

import { NativeSelect as Select } from '@chakra-ui/react'
import * as React from 'react'

interface NativeSelectFitContextValue {
  isMeasured: boolean
  setMeasured: (value: boolean) => void
}

// Shared between NativeSelectRoot and NativeSelectField so the root can hide
// its indicator (a sibling of the field, outside the field's own DOM subtree)
// for exactly as long as the field is hidden while it measures.
const NativeSelectFitContext =
  React.createContext<NativeSelectFitContextValue | null>(null)

interface NativeSelectRootProps extends Select.RootProps {
  icon?: React.ReactNode
  /**
   * Must match the `fitToContent` prop passed to the corresponding
   * `NativeSelectField`. Hides the whole root (field + indicator) until
   * that field completes its first content-based width measurement, so
   * the indicator doesn't render ahead of the field.
   */
  fitToContent?: boolean
}

export const NativeSelectRoot = React.forwardRef<
  HTMLDivElement,
  NativeSelectRootProps
>(function NativeSelect(props, ref) {
  const { icon, children, fitToContent, style, ...rest } = props
  const [isMeasured, setMeasured] = React.useState(() => !fitToContent)

  const contextValue = React.useMemo(
    () => ({ isMeasured, setMeasured }),
    [isMeasured]
  )

  return (
    <NativeSelectFitContext.Provider value={contextValue}>
      <Select.Root
        ref={ref}
        {...rest}
        style={{
          ...style,
          visibility:
            fitToContent && !isMeasured ? 'hidden' : style?.visibility,
        }}
      >
        {children}
        <Select.Indicator>{icon}</Select.Indicator>
      </Select.Root>
    </NativeSelectFitContext.Provider>
  )
})

interface NativeSelectItem {
  value: string
  label: string
  disabled?: boolean
}

interface NativeSelectField extends Select.FieldProps {
  items?: Array<string | NativeSelectItem>
  /**
   * Size the field to the width of the currently selected option's label
   * instead of the browser default (widest option in the list).
   *
   * CSS `field-sizing: content` (set on the `plain` variant recipe) already
   * achieves this in Chromium. This flag adds a DOM measurement fallback for
   * browsers that don't support `field-sizing` yet (Firefox/Safari).
   */
  fitToContent?: boolean
}

export type NativeSelectFieldProps = NativeSelectField

// Feature-detect native `field-sizing: content` support so the fallback
// below only runs where the CSS approach doesn't already handle sizing.
function supportsFieldSizing() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  return CSS.supports('field-sizing', 'content')
}

export const NativeSelectField = React.forwardRef<
  HTMLSelectElement,
  NativeSelectField
>(function NativeSelectField(props, ref) {
  const { items: itemsProp, children, fitToContent, style, ...rest } = props

  // Gate visibility until the first measurement (post font-load) has been
  // applied, so the field doesn't visibly snap from the wrong width to the
  // right one. Fields that don't opt into fitToContent render immediately.
  // Prefer the NativeSelectRoot's shared state (so its indicator hides in
  // lockstep) and fall back to local state if used without that context.
  const [localMeasured, setLocalMeasured] = React.useState(
    () => !fitToContent
  )
  const fitContext = React.useContext(NativeSelectFitContext)
  const isMeasured = fitContext ? fitContext.isMeasured : localMeasured
  const setIsMeasured = fitContext ? fitContext.setMeasured : setLocalMeasured

  const items = React.useMemo(
    () =>
      itemsProp?.map((item) =>
        typeof item === 'string' ? { label: item, value: item } : item
      ),
    [itemsProp]
  )

  const selectRef = React.useRef<HTMLSelectElement | null>(null)
  // Hidden text node used to measure the selected label's rendered width.
  // Unlike canvas measureText(), this renders through the browser's real
  // font pipeline, so it can't diverge from the select's actual font (e.g.
  // if a custom webfont hasn't finished loading yet in Safari).
  const measureRef = React.useRef<HTMLSpanElement | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLSelectElement | null) => {
      selectRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) {
        ;(ref as React.MutableRefObject<HTMLSelectElement | null>).current =
          node
      }
    },
    [ref]
  )

  // Reads the measurer's current rendered width and applies it (plus the
  // field's padding/border) to the select's inline width.
  const applyMeasuredWidth = React.useCallback(() => {
    const select = selectRef.current
    const measureEl = measureRef.current
    if (!fitToContent || !select || !measureEl || supportsFieldSizing())
      return

    const styles = window.getComputedStyle(select)
    const paddingStart = parseFloat(
      styles.paddingInlineStart || styles.paddingLeft || '0'
    )
    const paddingEnd = parseFloat(
      styles.paddingInlineEnd || styles.paddingRight || '0'
    )
    const borderWidth =
      parseFloat(styles.borderLeftWidth || '0') +
      parseFloat(styles.borderRightWidth || '0')
    const textWidth = measureEl.getBoundingClientRect().width

    select.style.width = `${Math.ceil(textWidth + paddingStart + paddingEnd + borderWidth)}px`
  }, [fitToContent])

  // Syncs the measurer's text + font to match the select's current
  // selection, then applies the resulting measured width.
  const measure = React.useCallback(() => {
    const select = selectRef.current
    const measureEl = measureRef.current
    if (!fitToContent || !select || !measureEl || supportsFieldSizing())
      return

    const selectedOption = select.options[select.selectedIndex]
    const label = selectedOption?.text ?? ''

    const styles = window.getComputedStyle(select)
    measureEl.style.fontFamily = styles.fontFamily
    measureEl.style.fontSize = styles.fontSize
    measureEl.style.fontWeight = styles.fontWeight
    measureEl.style.fontStyle = styles.fontStyle
    measureEl.style.fontVariant = styles.fontVariant
    measureEl.style.letterSpacing = styles.letterSpacing
    measureEl.textContent = label || '\u00A0'

    applyMeasuredWidth()
  }, [fitToContent, applyMeasuredWidth])

  // Initial measurement gate: wait for webfonts to finish loading (if they
  // haven't already) before measuring for the first time, then reveal the
  // field. Runs once per mount — subsequent updates are handled below.
  React.useLayoutEffect(() => {
    if (!fitToContent) return
    let cancelled = false

    const reveal = () => {
      if (cancelled) return
      measure()
      setIsMeasured(true)
    }

    if (
      typeof document !== 'undefined' &&
      document.fonts &&
      document.fonts.status !== 'loaded'
    ) {
      document.fonts.ready.then(reveal)
    } else {
      reveal()
    }

    return () => {
      cancelled = true
    }
    // Intentionally only re-runs when fitToContent itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitToContent])

  // Re-measure whenever the selection or option list changes.
  React.useLayoutEffect(() => {
    if (!isMeasured) return
    measure()
  }, [isMeasured, measure, rest.value, rest.defaultValue, items, children])

  // Font size here is fluid/rem-based and changes continuously with
  // viewport width (not just at breakpoints), so re-measure on resize too.
  React.useEffect(() => {
    if (!fitToContent || typeof window === 'undefined') return
    let frame: number | null = null
    const handleResize = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        measure()
      })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [fitToContent, measure])

  // Self-heal if the measurer's rendered size changes on its own, e.g. a
  // late font swap the effects above raced with.
  React.useEffect(() => {
    const measureEl = measureRef.current
    if (
      !fitToContent ||
      !measureEl ||
      typeof ResizeObserver === 'undefined'
    ) {
      return
    }
    const observer = new ResizeObserver(() => applyMeasuredWidth())
    observer.observe(measureEl)
    return () => observer.disconnect()
  }, [fitToContent, applyMeasuredWidth])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      rest.onChange?.(e)
      measure()
    },
    [measure, rest]
  )

  return (
    <>
      <Select.Field
        ref={setRefs}
        {...rest}
        style={{
          ...style,
          visibility:
            fitToContent && !isMeasured ? 'hidden' : style?.visibility,
        }}
        onChange={handleChange}
      >
        {children}
        {items?.map((item) => (
          <option
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </option>
        ))}
      </Select.Field>
      {fitToContent && (
        <span
          ref={measureRef}
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  )
})
