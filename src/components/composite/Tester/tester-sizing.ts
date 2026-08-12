// src/components/composite/Tester/tester-sizing.ts
export const TESTER_SIZES = {
  table: {
    fontSize: { base: '2rem', sm: '3rem', '2xl': '3.25rem', '3xl': '4rem' },
    lineHeight: { base: '3rem', sm: '4rem', '2xl': '4.25rem', '3xl': '5rem' },
    paddingTop: '3rem',
  },
  default: {
    fontSize: '6rem',
    lineHeight: '8rem',
    paddingTop: '0.5rem',
  },
} as const

export function getTesterSizes(table: boolean) {
  return table ? TESTER_SIZES.table : TESTER_SIZES.default
}
