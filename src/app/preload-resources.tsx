import type { Webfont } from '@/sanity/lib/webfonts'
import ReactDOM from 'react-dom'

function resourceType(webfont: Webfont) {
  if (webfont.vf) return 'font/truetype-variations'
  if (webfont.woff2) return 'font/woff2'
  return 'font/woff'
}

function fontFaceBlock(webfont: Webfont) {
  const {
    classId,
    fontFamily,
    fontFamilyVariable,
    woff,
    woff2,
    vf,
    fontVariationSettings,
  } = webfont

  if (fontVariationSettings && vf) {
    return `
      @font-face {
        font-display: block;
        font-family: "${fontFamilyVariable}";
        src: url("${vf}") format("truetype-variations");
        font-weight: normal;
        font-style: normal;
      }
      @supports (font-variation-settings: normal) {
        .${classId} {
          font-family: "${fontFamilyVariable}";
          font-variation-settings: ${fontVariationSettings};
        }
      }`
  }

  if (woff2 || woff) {
    const src = [
      woff2 && `url("${woff2}") format("woff2")`,
      woff && `url("${woff}") format("woff")`,
    ]
      .filter(Boolean)
      .join(', ')

    return `
@font-face {
  font-display: block;
  font-family: "${fontFamily}";
  src: ${src};
  font-weight: normal;
  font-style: normal;
}
.${classId} {
  font-family: "${fontFamily}", "Comic Sans MS";
}`
  }

  return ''
}

export async function PreloadResources({
  webfonts,
}: {
  webfonts: Webfont[]
}) {
  for (const webfont of webfonts) {
    const url = webfont.vf ?? webfont.woff2 ?? webfont.woff
    if (!url) continue
    ReactDOM.preload(url, {
      as: 'font',
      type: resourceType(webfont),
      crossOrigin: 'anonymous',
    })
  }

  const css = webfonts.map(fontFaceBlock).filter(Boolean).join('\n')

  return css ? <style>{css}</style> : null
}
