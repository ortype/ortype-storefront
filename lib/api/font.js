import { basePrice } from '../settings'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import Helpers from '../utils/helpers'
import OrtypeAbstractFont from './OrtypeAbstractFont'

export function getFontFiles(){
  const paths = []
  for (const fontDir of Helpers.getFontDirectories()) {
    for (const fontFile of Helpers.getFontFiles(fontDir)) {
      paths.push(fontFile)
    }
  }
  return paths
}

export async function getFonts(){
  const fonts = []
  for (const fontFile of getFontFiles()){
    const font = await OrtypeAbstractFont.getInstance(fontFile)
    fonts.push(font)
  }
  return fonts
}

export async function getFontProductData(font, force = false) {
  const products = []
  if (!(await font.shouldUpdate()) && !force) {
    return products
  }
  const variantCount = font.isVariable && font.getVariations()?.instances.length
  const compareAt = variantCount ? variantCount * basePrice : 9000
  // The regular expression `/.*\/([^\/]*)\.(ttf|otf)/` matches any characters (`.*`) followed by a forward slash (`\/`), then captures any non-forward slash characters (`[^\/]*`) until it reaches either the `.ttf` or `.otf` extension (`\.(ttf|otf)`)
  const fontFileAsSlug = font.file.match(/.*\/([^\/]*)\.(ttf|otf)/)[1]

  const parentProduct = {
    _id: `font-${nanoid()}`,
    _type: 'font',
    slug: { current: slugify(fontFileAsSlug, { lower: true }) },
    uid: font.getUid(),
    version: font.version,
    name: font.familyName,
    price: variantCount ? compareAt * 0.5 : compareAt,
    compareAt,
    variants: [],
    metafields: [],
  }

  for (const [key, value] of Object.entries(getMetaData(font))) {
    parentProduct.metafields.push({
      _key: nanoid(),
      key,
      value: value.toString(),
    })
  }

  if (font.isVariable) {
    // only variable font files have multiple variants
    const dupChecker = []
    for (const [
      index,
      variation,
    ] of font.getVariations().instances.entries()) {
      if (variation?.name?.en) {
        if (dupChecker.includes(variation.name.en)) {
          console.log('Duplicate checker skipped: ', variation.name.en)
          continue
        } else {
          dupChecker.push(variation.name.en)
        }
        const variant = {
          _id: `fontVariant-${nanoid()}`,
          _type: 'fontVariant',
          name: `${font.familyName} ${variation.name[font.lang]}`,
          slug: {
            current: slugify(
              `${fontFileAsSlug} ${variation.name[font.lang]}`,
              { lower: true }
            ),
          },
          uid: font.getUid(variation.name[font.lang]),
          parentUid: font.getUid(),
          optionName: variation.name[font.lang],
          version: font.version,
          price: basePrice,
          index,
          metafields: [],
        }
        for (const [key, value] of Object.entries(
          getMetaData(font, variation)
        )) {
          variant.metafields.push({
            _key: nanoid(),
            key,
            value: value.toString(),
          })
        }
        for (const [key, value] of Object.entries(variation.coordinates)) {
          variant.metafields.push({
            _key: nanoid(),
            key,
            value: value.toString(),
          })
        }
        parentProduct.variants.push(variant)
      }
    }
  } else {
    // This is a font with a single variant
    const variant = {
      _id: `fontVariant-${nanoid()}`,
      _type: 'fontVariant',
      uid: font.getUid(font.getInfo().fullName[font.lang]),
      parentUid: font.getUid(),
      name: font.getInfo().fullName[font.lang],
      slug: {
        current: slugify(
          `${fontFileAsSlug} ${font.getInfo().fullName[font.lang]}`,
          { lower: true }
        ),
      },
      optionName: font.getInfo().fontSubfamily[font.lang],
      version: font.version,
      price: basePrice,
      metafields: [],
    }
    for (const [key, value] of Object.entries(getMetaData(font, variant))) {
      variant.metafields.push({ key, value: value.toString() })
    }
    parentProduct.variants.push(variant)
  }

  return parentProduct
}

export async function getMetaData(font, variation) {
  const { usWinAscent, usWinDescent, sCapHeight } = font.instance.tables.os2

  let meta = {
    ascent: usWinAscent,
    descent: usWinDescent,
    capHeight: sCapHeight,
    familyFile: font.file,
  }
  if (variation && font.isVariable) {
    // console.log(variation)
    // console.log('variation.name[font.lang]: ', variation.name[font.lang])
    meta = {
      ...meta,
      ...{
        // these files maybe wrong because we use font name for filename which may be different
        otf: font.getOtfFile(variation.name[font.lang]),
        woff: font.getWoffFile(variation.name[font.lang]),
        woff2: font.getWoff2File(variation.name[font.lang]),
      },
    }
  } else if (!font.isVariable) {
    meta = {
      ...meta,
      ...{
        uid: variation
          ? font.getUid(font.getInfo().fontSubfamily[font.lang])
          : font.getUid(),
        // these files maybe wrong because we use font name for filename which may be different
        otf: font.getOtfFile(font.getInfo().fontSubfamily[font.lang]),
        woff: font.getWoffFile(font.getInfo().fontSubfamily[font.lang]),
        woff2: font.getWoff2File(font.getInfo().fontSubfamily[font.lang]),
      },
    }
  }

  if (font.isVariable) {
    meta.axesCount = font.getVariations().axes.length
    font.getVariations().axes.forEach((axe, index) => {
      meta[`axes${index + 1}`] = axe.tag
    })
  }
  return meta
}