import { GET_WEBFONTS } from '@/graphql/queries'
import { useQuery } from '@apollo/client'
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

const {
  MIN_FONT,
  MAX_FONT,
  S_MULTIPLIER,
  M_MULTIPLIER,
  L_MULTIPLIER,
  BASELINE,
  BREAKPOINTS,
} = FontScale

const Webfonts = ({ children }) => {
  const { loading, data } = useQuery(GET_WEBFONTS)
  const getFontFaceBlocks = () => {
    const fontFaceArray = []
    if (loading === false && data) {
      const { webfonts } = data.webfonts
      for (const font of webfonts) {
        const woff2 = font.woff2
        const woff = font.woff
        if (font.fontVariationSettings) {
          const variable = font.vf
          // no duplicate keys in objects
          // but let's figure out the fallback later
          /*
          fontFaceArray.push({
            '@font-face': {
              fontFamily: `'${font.fontFamily}'`,
              src: `url('${woff2}') format('woff2'), url('${woff}') format('woff')`,
              fontWeight: `normal`,
              fontStyle: `normal`
            },
            [`.${font.classId}`]: {
              fontFamily: `'${font.fontFamily}'`
            }
          });
          */
          fontFaceArray.push({
            '@font-face': {
              fontFamily: `'${font.fontFamilyVariable}'`,
              src: `url('${variable}') format('truetype-variations')`,
              // src: `url('${woff2}') format('woff2'), url('${woff}') format('woff')`,
              // src: `url('${woff2}') format('woff2'), url('${woff}') format('woff')`,
              fontWeight: `normal`,
              fontStyle: `normal`,
            },
            '@supports (font-variation-settings: normal)': {
              [`.${font.classId}`]: {
                fontFamily: `"${font.fontFamilyVariable}"`,
                fontVariationSettings: font.fontVariationSettings,
                transition: `all 1s linear`,
              },
            },
          })
        } else {
          fontFaceArray.push({
            '@font-face': {
              fontFamily: `'${font.fontFamily}'`,
              src: `url('${woff2}') format('woff2'), url('${woff}') format('woff')`,
              fontWeight: `normal`,
              fontStyle: `normal`,
            },
            [`.${font.classId}`]: {
              fontFamily: `"${font.fontFamily}", "Comic Sans MS"`,
            },
          })
        }
      }
    }
    // console.log("fontFaceArray: ", fontFaceArray);
    return fontFaceArray.map((fontFace, idx) => (
      <Global key={idx} styles={{ ...fontFace }} />
    ))
  }

  return (
    <>
      {getFontFaceBlocks()}
      <Global
        styles={{
          html: {
            fontFamily: `Alltaf-Regular`,
            fontSize: `${MIN_FONT}rem`,
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
            // backgroundColor: `#F1F1F1`,
          },
          [`@font-face`]: {
            fontFamily: 'Alltaf-Regular',
            src: `url("https://assets.ortype.is/v3/alltaf-regular-webfont.woff2") format("woff2"), url("https://assets.ortype.is/v3/alltaf-regular-webfont.woff") format("woff")`,
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
          body: {
            // fontFamily: "Alltaf-Regular",
            margin: 0,
            padding: 0,
          },
          [`*`]: {
            boxSizing: `border-box`,
          },
        }}
      />
      {children}
    </>
  )
}

export default Webfonts
