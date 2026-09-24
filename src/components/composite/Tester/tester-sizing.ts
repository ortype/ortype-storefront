// src/components/composite/Tester/tester-sizing.ts
// Numeric rem magnitudes - the single source of truth for both the
// resting CSS values below and the transform scale ratios used to fake
// the transition between them (see TESTER_SCALE_STATIC_VARS and
// use-tester-scale-transition.ts). Keeping the raw numbers here means
// the two derivations can't drift out of sync.
//
// `fontSize`/`lineHeight`/`paddingTop` are CSS `clamp()` strings rather
// than plain rem numbers: the list-mode specimen is the one place on the
// page where fluid (as opposed to Globals.tsx's stepped) scaling matters
// most, so it keeps its own independent fluid formula. Each is expressed
// in `px`/`vw` (not `rem`) so it does NOT compound with Globals.tsx's
// now-stepped root font-size - otherwise it would inherit an extra jump
// at every root breakpoint on top of its own smoothing. `paddingTop`
// keeps the same 0.5/6 ratio to `fontSize` that the old flat rem values
// had, so it still scales in lockstep with the specimen text.
const DEFAULT = {
  fontSize: 'clamp(86px, calc(3.24vw + 67.88px), 130px)',
  lineHeight: 'clamp(115px, calc(4.32vw + 90.48px), 173px)',
  paddingTop: 'clamp(7.17px, calc(0.27vw + 5.66px), 10.83px)',
} as const

// `DEFAULT.fontSize` is now a `clamp()` string, so it can no longer be
// divided against `TABLE.fontSize[bp]` in JS (see TESTER_SCALE_STATIC_VARS
// below). This is a plain-number stand-in - the clamp's upper bound,
// expressed in the same rem magnitude the old flat value used - for that
// ratio math only. The scale-flip it drives is a sub-300ms transitional
// illusion (see use-tester-scale-transition.ts), so an approximation that
// won't be pixel-perfect at every viewport width is an acceptable
// trade-off for keeping the trick working.
const DEFAULT_SCALE_REFERENCE_REM = 8.125

const TABLE = {
  fontSize: { base: 2, sm: 3, '2xl': 3.25, '3xl': 4 },
  lineHeight: { base: 3, sm: 4, '2xl': 4.25, '3xl': 5 },
  paddingTop: 3,
} as const

// CSS custom properties that drive table/list sizing. Only the
// ancestor grid (see FontList) writes these - once per toggle - via
// `getTesterCssVars`. Every descendant reads the same static
// `var(--tester-*)` references (see the *_VAR constants and
// TESTER_ITEM_CSS below), so their generated styles never change shape
// when `table` flips - letting Chakra/Panda reuse the same cached
// class for every item instead of re-serializing N items' worth of
// styles.
//
// These now change INSTANTLY (no `transition`): profiling showed
// Chrome cannot composite a `font-size` animation ( "Compositing
// failed: Unsupported CSS property: font-size" ), which forced a full
// Layout+Paint pass on the main thread every frame for the whole
// animation. A single instant layout pass is cheap; the animated
// *look* is instead produced by TESTER_ITEM_CSS's `transform: scale`,
// driven by use-tester-scale-transition.ts, which the compositor can
// animate off the main thread.
export const TESTER_CSS_VARS = {
  table: {
    '--tester-font-size': {
      base: `${TABLE.fontSize.base}rem`,
      sm: `${TABLE.fontSize.sm}rem`,
      '2xl': `${TABLE.fontSize['2xl']}rem`,
      '3xl': `${TABLE.fontSize['3xl']}rem`,
    },
    '--tester-line-height': {
      base: `${TABLE.lineHeight.base}rem`,
      sm: `${TABLE.lineHeight.sm}rem`,
      '2xl': `${TABLE.lineHeight['2xl']}rem`,
      '3xl': `${TABLE.lineHeight['3xl']}rem`,
    },
    '--tester-padding-top': `${TABLE.paddingTop}rem`,
  },
  default: {
    // `DEFAULT.fontSize`/`DEFAULT.lineHeight`/`DEFAULT.paddingTop` are
    // already complete `clamp()` expressions (see the constant above) -
    // unlike the plain numeric TABLE values above, they must NOT get a
    // `rem` suffix appended.
    '--tester-font-size': DEFAULT.fontSize,
    '--tester-line-height': DEFAULT.lineHeight,
    '--tester-padding-top': DEFAULT.paddingTop,
  },
} as const

export function getTesterCssVars(table: boolean) {
  return table ? TESTER_CSS_VARS.table : TESTER_CSS_VARS.default
}

// Stable references for consumers - identical on every render
// regardless of `table`.
export const TESTER_FONT_SIZE_VAR = 'var(--tester-font-size)'
export const TESTER_LINE_HEIGHT_VAR = 'var(--tester-line-height)'
export const TESTER_PADDING_TOP_VAR = 'var(--tester-padding-top)'

// "From" scale ratios: applied the instant a mode switch commits, so
// the specimen text - whose real font-size has already snapped to its
// new value - still *looks* like its old size for one frame.
// use-tester-scale-transition then flips `--tester-scale` to point at
// `1` (true size) instead, which animates via `transform` on the
// compositor thread without ever touching layout.
//
// These are STATIC - always present, never recomputed per toggle -
// applied once on the grid ancestor alongside `getTesterCssVars`.
// use-tester-scale-transition only ever toggles which named var
// `--tester-scale` points to (via direct DOM mutation, not React
// state), so no responsive math has to happen in JS/at runtime.
export const TESTER_SCALE_STATIC_VARS = {
  '--tester-scale-to-table': {
    base: DEFAULT_SCALE_REFERENCE_REM / TABLE.fontSize.base,
    sm: DEFAULT_SCALE_REFERENCE_REM / TABLE.fontSize.sm,
    '2xl': DEFAULT_SCALE_REFERENCE_REM / TABLE.fontSize['2xl'],
    '3xl': DEFAULT_SCALE_REFERENCE_REM / TABLE.fontSize['3xl'],
  },
  '--tester-scale-to-list': {
    base: TABLE.fontSize.base / DEFAULT_SCALE_REFERENCE_REM,
    sm: TABLE.fontSize.sm / DEFAULT_SCALE_REFERENCE_REM,
    '2xl': TABLE.fontSize['2xl'] / DEFAULT_SCALE_REFERENCE_REM,
    '3xl': TABLE.fontSize['3xl'] / DEFAULT_SCALE_REFERENCE_REM,
  },
} as const

// Static css object for the per-item grid cell: real layout sizing
// only (inherited by descendants via the *_VAR constants). No
// transform here - the grid cell's own box must stay at its true,
// already-reflowed size so it doesn't visually overlap neighboring
// cells in table mode.
export const TESTER_ITEM_CSS = {
  fontSize: TESTER_FONT_SIZE_VAR,
  lineHeight: TESTER_LINE_HEIGHT_VAR,
  paddingTop: TESTER_PADDING_TOP_VAR,
} as const

// Static css object for the wrapper around JUST the specimen text
// (see Tester/index.tsx). Scoping the transform this tightly - rather
// than to the whole grid cell - keeps the title/variant-selector/buy
// button row visually stable (it never had a size that needed
// animating), and `overflow: hidden` clips the specimen text's
// transient over/under-size to its own box instead of bleeding into
// that row or neighboring cards.
export const TESTER_SCALE_WRAPPER_CSS = {
  transform: 'scale(var(--tester-scale, 1))',
  transformOrigin: 'center center',
  transition: 'transform var(--tester-scale-duration, 0.2s) ease',
  willChange: 'transform',
  overflow: 'hidden',
} as const
