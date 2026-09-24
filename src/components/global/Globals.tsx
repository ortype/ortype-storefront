'use client'
import { Global } from '@emotion/react'
import React from 'react'
import { breakpoints as chakraBreakpoints } from '@/theme/breakpoints'

// Reuse Chakra's own responsive breakpoints (`sm/md/lg/xl/2xl/3xl`) as the
// step boundaries for the root font-size below, so the two scales never
// drift apart. Chakra defines these as `em` strings (e.g. `"64em"`); `em`
// and `rem` resolve identically in a media-query context (both are relative
// to the root element's initial font-size), so parsing out the numeric
// portion and reusing it with `rem` below is safe.
export const breakpoints = Object.values(chakraBreakpoints).map((bp) =>
  parseFloat(bp)
)
export const MQ = breakpoints.map(
  (bp) => `@media screen and (min-width: ${bp}rem)`
)
export const FontScale = {
  BASELINE: 1.5,
  MIN_FONT: 0.9,
  MAX_FONT: 1.35,
  BREAKPOINTS: breakpoints,
  // One entry for the base (< first breakpoint) tier, plus one per
  // breakpoint - evenly spaced between MIN_FONT and MAX_FONT. Each tier is
  // a fixed value (no `calc()`/`vw`), so resizing within a tier is free and
  // a layout pass only happens when crossing a breakpoint.
  FONT_SIZE_STEPS: [0.9, 0.975, 1.05, 1.125, 1.2, 1.275, 1.35],
}

/*
Font-size steps in sync with Chakra's breakpoints (base, sm, md, lg, xl, 2xl, 3xl):
0.9rem, 0.975rem, 1.05rem, 1.125rem, 1.2rem, 1.275rem, 1.35rem
Unlike the previous fluid `calc()` implementation, these are static per
breakpoint tier - no continuous recalculation on resize.
*/

const { BASELINE, FONT_SIZE_STEPS } = FontScale

// `OrAlltaf-WebVF` is a variable font (wght axis 400-700) served statically
// from ortype-graphql-api's /public folder. Both faces below load the same
// file, pinned to the `wght` coordinate matching their named instance
// (Regular=400, Bold=700), so existing `fontFamily: 'Alltaf-Regular'` /
// `'Alltaf-Bold'` usages keep working unchanged.
export const ALLTAF_VF_BASE = `${process.env.NEXT_PUBLIC_API_URL}/OrAlltaf-WebVF`

const Globals = () => {
  return (
    <>
      <Global
        styles={{
          '@font-face': {
            fontFamily: 'Alltaf-Regular-OTF',
            src: 'url("https://assets.ortype.is/v3/OrAlltafOTF-Regular.woff2") format("woff2"), url("https://assets.ortype.is/v3/OrAlltafOTF-Regular.woff") format("woff")',
            fontWeight: 'normal',
          },
        }}
      />
      <Global
        styles={{
          '@font-face': {
            fontFamily: 'Alltaf-Var',
            src: `url("${ALLTAF_VF_BASE}.woff2") format("woff2"), url("${ALLTAF_VF_BASE}.woff") format("woff")`,
            fontWeight: '400 700',
            fontStyle: 'normal',
          },
        }}
      />
      <Global
        styles={{
          '@font-face': {
            fontFamily: 'Alltaf-Regular',
            src: `url("${ALLTAF_VF_BASE}.woff2") format("woff2"), url("${ALLTAF_VF_BASE}.woff") format("woff")`,
            fontWeight: 400,
            fontStyle: 'normal',
          },
        }}
      />
      <Global
        styles={{
          html: {
            fontFamily: `Alltaf-Var`,
            fontSize: `${FONT_SIZE_STEPS[0]}rem`,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: `${BASELINE / 2}rem`,
            fontWeight: 400,
            ...MQ.reduce((acc, mq, index) => {
              acc[mq] = { fontSize: `${FONT_SIZE_STEPS[index + 1]}rem` }
              return acc
            }, {} as Record<string, { fontSize: string }>),
          },
        }}
      />
    </>
  )
}

export default Globals
