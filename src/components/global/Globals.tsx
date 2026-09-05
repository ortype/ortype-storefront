'use client'
import { Global } from '@emotion/react'
import React from 'react'

export const breakpoints = [35, 70, 120]
export const MQ = breakpoints.map(
  (bp) => `@media screen and (min-width: ${bp}rem)`
)
export const FontScale = {
  S_MULTIPLIER: 1,
  M_MULTIPLIER: 0.85,
  L_MULTIPLIER: 1.1,
  BASELINE: 1.5,
  MIN_FONT: 0.9,
  MAX_FONT: 1.35,
  BREAKPOINTS: breakpoints,
}

/*
Base: 0.9rem (MIN_FONT)
•  Small viewport (35rem+): Fluid between 0.765rem to 1.1475rem (with M_MULTIPLIER 0.85)
•  Medium viewport (70rem+): Fluid between 0.99rem to 1.485rem (with L_MULTIPLIER 1.1)  
•  Large viewport (120rem+): 1.35rem (MAX_FONT)
*/

const {
  MIN_FONT,
  MAX_FONT,
  S_MULTIPLIER,
  M_MULTIPLIER,
  L_MULTIPLIER,
  BASELINE,
  BREAKPOINTS,
} = FontScale

// `OrAlltafWebVF` is a variable font (wght axis 400-700) served statically
// from ortype-graphql-api's /public folder. Both faces below load the same
// file, pinned to the `wght` coordinate matching their named instance
// (Regular=400, Bold=700), so existing `fontFamily: 'Alltaf-Regular'` /
// `'Alltaf-Bold'` usages keep working unchanged.
export const ALLTAF_VF_BASE = `${process.env.NEXT_PUBLIC_API_URL}/OrAlltafWebVF`

const Globals = () => {
  return (
    <>
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
            fontFamily: `Alltaf-Regular`,
            fontSize: `${MIN_FONT}rem`,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: `${BASELINE / 2}rem`,
            [MQ[0]]: {
              fontSize: `calc(${MIN_FONT * M_MULTIPLIER}rem + (${
                MAX_FONT * M_MULTIPLIER
              } - ${MIN_FONT * M_MULTIPLIER}) * (100vw - ${
                BREAKPOINTS[0]
              }rem) / (${BREAKPOINTS[2]} - ${BREAKPOINTS[0]}))`,
            },
            [MQ[1]]: {
              fontSize: `calc(${MIN_FONT * L_MULTIPLIER}rem + (${
                MAX_FONT * L_MULTIPLIER
              } - ${MIN_FONT * L_MULTIPLIER}) * (100vw - ${
                BREAKPOINTS[0]
              }rem) / (${BREAKPOINTS[2]} - ${BREAKPOINTS[0]}))`,
            },
            [MQ[2]]: {
              fontSize: `${MAX_FONT}rem`,
            },
          },
        }}
      />
    </>
  )
}

export default Globals
