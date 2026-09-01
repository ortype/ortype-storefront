// src/components/composite/Tester/tester-sizing.ts
// CSS custom properties that drive the table/list sizing animation.
// Only the ancestor grid (see FontList) writes these - once per toggle -
// via `getTesterCssVars`. Every descendant reads the same static
// `var(--tester-*)` references (see the *_VAR constants and
// TESTER_ITEM_CSS below), so their generated styles never change shape
// when `table` flips. That lets Chakra/Panda reuse the same cached
// class for every item instead of re-serializing N items' worth of
// styles, and lets the browser animate the change purely through CSS
// inheritance + a `transition` declared once on the consumers.
export const TESTER_CSS_VARS = {
  table: {
    '--tester-font-size': {
      base: '2rem',
      sm: '3rem',
      '2xl': '3.25rem',
      '3xl': '4rem',
    },
    '--tester-line-height': {
      base: '3rem',
      sm: '4rem',
      '2xl': '4.25rem',
      '3xl': '5rem',
    },
    '--tester-padding-top': '3rem',
  },
  default: {
    '--tester-font-size': '6rem',
    '--tester-line-height': '8rem',
    '--tester-padding-top': '0.5rem',
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

// Static css object for the per-item grid cell. Declared once at module
// scope (not recreated per render/per item) and only references CSS
// variables, so toggling table/list never touches per-item styles.
export const TESTER_ITEM_CSS = {
  fontSize: TESTER_FONT_SIZE_VAR,
  lineHeight: TESTER_LINE_HEIGHT_VAR,
  paddingTop: TESTER_PADDING_TOP_VAR,
  transition:
    'font-size 0.2s ease, line-height 0.2s ease, padding-top 0.2s ease',
} as const
