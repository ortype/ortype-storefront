import { Font } from 'lib-font'
import type { NextApiRequest, NextApiResponse } from 'next'

// how to make a addeventlistener onload wrapped in a promise so i can await it?
// https://github.com/search?q=repo%3APomax%2Flib-font%20onload&type=code
// https://github.com/Pomax/lib-font/blob/master/src/eventing.js#L36

// fvar table has full data
// https://github.com/Pomax/lib-font/blob/master/src/opentype/tables/simple/variation/fvar.js

// When the font's up and loaded in, let's do some testing!
function doSomeFontThings(evt) {
  // We can either rely on scoped access to font, but because the onload function
  // is not guaranteed to live in the same scope, the font is in the event, too.
  const font = evt.detail.font

  const FVAR = font.opentype.tables.fvar
  console.log(`Font NAMES: `, font.opentype.tables.name)

  // nameID: 260, nameID: 2

  /*
  NameRecord {
    platformID: 3,
    encodingID: 1,
    languageID: 1033,
    nameID: 2,
    length: 14,
    offset: 292,
    string: [Getter]
  },
*/

  console.log(`Font has fvar table: `, FVAR.instances)

  // Oh wait, this is a variable font, isn't it.
  console.log(`This is a variable font: ${!!font.opentype.tables.fvar}`)

  // create a font info table like dianmo gauntlet with instances
  /*
instances: [{
subfamilyNameID: 17
coordinates: [0: 0, 1: 1]
postScriptNameID: 6
name: "Pre 1st"
fontVariationSettings: ""VRTL" 0, "HRTL" 0"
id: "7f96abb6-e658-48b8-a224-bfa55df618f3"
}]
*/

  // Which axes does it support?
  console.log(
    `This variable font supposed the following axes: ${`"${font.opentype.tables.fvar
      .getSupportedAxes()
      .join(`", "`)}"`}`
  )

  /*// First, let's test some characters:
  ;[`a`, `→`, `嬉`].forEach((char) =>
    console.log(`Font supports '${char}': ${font.supports(char)}`)
  )

  // Then, let's check some OpenType things
  const GSUB = font.opentype.tables.GSUB

  // Let's figure out which writing scripts this font supports:
  console.log(
    `This font supports the following scripts: ${`"${GSUB.getSupportedScripts().join(
      `", "`
    )}"`}`
  )

  // DFLT is a given, but let's see if `latn` has any special language/system rules...
  const latn = GSUB.getScriptTable('latn')
  console.log(
    `Special langsys for "latn": ${`"${GSUB.getSupportedLangSys(latn).join(
      `", "`
    )}"`}`
  )

  // Wow, "Northern Sami" support? Really? Which OpenType features does that use?
  const nsm = GSUB.getLangSysTable(latn, 'NSM ')
  console.log(
    `OpenType features for the Northern Sami version of latin script:`,
    `"${GSUB.getFeatures(nsm)
      .map((f) => f.featureTag)
      .join(`", "`)}"`
  )
*/
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fontFamilyDisplayName = 'Or Similar'
  const file =
    'http://localhost:8000/fonts/Or-Similar/VAR/Or-Similar-Variable.ttf'
  console.log('libfont test running: ', file)
  const font = new Font(fontFamilyDisplayName)
  font.src = file
  font.onload = (e) => doSomeFontThings(e)
  return res.status(200).json({ message: 'Successful' })
}
