import {
  apiClient,
  findByUidAndVersionWithVariants,
  getAllFontVariants,
} from 'lib/sanity.client'
import { nanoid } from 'nanoid'
import slugify from 'slugify'

import { basePrice } from 'lib/settings'
import { getFontDirectories, getFontFiles } from '../utils/helpers'
import OrType from './OrType'

// @TODO: this function calls a very similar helper, take a look
export function getFontFilePaths() {
  const paths = []
  for (const fontDir of getFontDirectories()) {
    for (const fontFile of getFontFiles(fontDir)) {
      paths.push(fontFile)
    }
  }
  return paths
}

export async function getFonts() {
  const fonts = []
  for (const fontFilePath of getFontFilePaths()) {
    const font = await OrType.getInstance(fontFilePath)
    let errors = []
    if (font.familyName.toLowerCase().includes('italic')){
      errors.push(['PANIC FORBIDDEN familyName ITALIC:', font.familyName, fontFilePath])
    }
    if (font.familyName.toLowerCase().includes('bold')){
      errors.push(['PANIC FORBIDDEN familyName BOLD:', font.familyName, fontFilePath])
    }
    if (font.familyName.toLowerCase().includes('regular')){
      errors.push(['PANIC FORBIDDEN familyName REGULAR:', font.familyName, fontFilePath])
    }
    if (font.familyName.toLowerCase().includes('var')){
      errors.push(['PANIC FORBIDDEN familyName VAAAR:', font.familyName, fontFilePath])
    }
    if (errors.length){
      for (const error of errors){
        console.warn('\x1b[31m%s\x1b[0m', ...error)
      }
    }
    fonts.push(font)
  }
  return fonts
}

const variableCacheFont = {}

export async function getSanityFont(fontFile, fresh = false) {
  if (!variableCacheFont[fontFile.getUid()] || fresh) {
    console.log('\x1b[33mMiss', fontFile.getUid())
    variableCacheFont[fontFile.getUid()] =
      await findByUidAndVersionWithVariants(fontFile.getUid(), fontFile.version)
  } else {
    console.log('\x1b[32mHit', fontFile.getUid())
  }
  return variableCacheFont[fontFile.getUid()]
}

const allVariants = []

export async function getAllVariants() {
  if (!allVariants?.length) {
    allVariants.push(...(await getAllFontVariants()))
  }
  return allVariants
}

/**
 * @returns {Promise<boolean>}
 */
export async function shouldUpdate(fontFile) {
  const sanityFont = await getSanityFont(fontFile, true)
  if (sanityFont) {
    const fileModified = new Date(await fontFile.modifiedAt())
    const documentModified = new Date(sanityFont._updatedAt)
    return fileModified > documentModified
  }
  return true
}

// this can be anywhere else, its just cool to abstract everything in fontFile
// there is high chance on being able to run whole sync with only requirement the file path
// export async function maybeUpsert(fontFile: string, force: boolean = false): Promise<void> {
/**
 * Upserts a font file into Sanity CMS if it needs to be updated or if forced.
 *
 * @param {string} fontFile - The font file to upsert.
 * @param {boolean} [force=false] - Whether to force the upsert even if the font file doesn't need to be updated.
 * @returns {Promise<void>} - A promise that resolves when the upsert is completed.
 */
export async function maybeUpsert(fontFile, force = false) {
  if (!(await shouldUpdate(fontFile)) && !force) {
    return
  }
  // on first creation the font does not exist and the reference is invalid
  // the variation id is changing with the one we provide manually after creation
  // its common to create children first in these relational cases
  const transaction = apiClient.transaction()
  for (const variantDocument of await toSanityVariants(fontFile)) {
    transaction
      .createIfNotExists(variantDocument)
      .patch(variantDocument._id, (patch) => patch.set(variantDocument))
  }

  const fontDocument = await toSanityFont(fontFile)
  transaction
    .createIfNotExists(fontDocument)
    .patch(fontDocument._id, (patch) => patch.set(fontDocument))
    .patch(fontDocument._id, (patch) =>
      patch.set({
        variants: fontDocument.variants,
      })
    )
  return await transaction.commit({ dryRun: false })
}

export async function getPrice(fontFile) {
  const sanityFont = await getSanityFont(fontFile)
  const variantCount =
    sanityFont && sanityFont._id ? sanityFont.variants.length : 1
  return (await getCompareAt(fontFile)) * (variantCount ? 0.5 : 1)
}

export async function getCompareAt(fontFile) {
  const sanityFont = await getSanityFont(fontFile)
  const variantCount =
    sanityFont && sanityFont._id ? sanityFont.variants.length : 1
  return (variantCount ? variantCount : 1) * basePrice
}

export async function toSanityFont(fontFile) {
  const sanityObject = {
    _id: `font-${nanoid()}`,
    _type: 'font',
    slug: { current: fontFile.fileSlug() },
    uid: fontFile.getUid(),
    version: fontFile.version,
    name: fontFile.familyName,
    price: await getPrice(fontFile),
    compareAt: await getCompareAt(fontFile),
    variants: await toSanityVariantsReference(fontFile),
    metafields: [],
  }
  const sanityFont = await getSanityFont(fontFile)
  // This UID lookup ALSO prevents multiple font documents from being created
  if (sanityFont && sanityFont._id) {
    sanityObject._id = sanityFont._id
  }

  for (const [key, value] of Object.entries(await getMetaData(fontFile))) {
    sanityObject.metafields.push({
      _key: nanoid(),
      key,
      value: value.toString(),
    })
  }
  return sanityObject
}

export async function toSanityVariants(fontFile) {
  const sanityFont = await getSanityFont(fontFile)
  if (!fontFile.isVariable) {
    // This is a font with a single variant
    const variant = {
      _id: `fontVariant-${nanoid()}`,
      _type: 'fontVariant',
      uid: fontFile.getUid(fontFile.getInfo().fullName[fontFile.lang]),
      parentUid: fontFile.getUid(),
      name: fontFile.getInfo().fullName[fontFile.lang],
      slug: {
        current: slugify(
          `${fontFile.fileSlug()} ${
            fontFile.getInfo().fullName[fontFile.lang]
          }`,
          { lower: true }
        ),
      },
      optionName: fontFile.getInfo().fontSubfamily[fontFile.lang],
      version: fontFile.version,
      price: basePrice,
      metafields: [],
    }
    if (sanityFont && sanityFont._id) {
      // This UID lookup ALSO prevents multiple font documents from being created
      const existingVariant = (await getAllVariants()).find(
        (v) => v.uid === variant.uid
      )
      if (existingVariant) {
        variant._id = existingVariant._id
      }
    }
    for (const [key, value] of Object.entries(
      await getMetaData(fontFile, variant)
    )) {
      variant.metafields.push({ _key: nanoid(), key, value: value.toString() })
    }
    return [variant]
  }

  const variants = []
  // only variable font files have multiple variants
  const dupChecker = []
  for (const [index, variation] of fontFile
    .getVariations()
    .instances.entries()) {
    if (variation?.name?.en) {
      if (dupChecker.includes(variation.name.en)) {
        continue
      } else {
        dupChecker.push(variation.name.en)
      }
      const variant = {
        _id: `fontVariant-${nanoid()}`,
        _type: 'fontVariant',
        name: `${fontFile.familyName} ${variation.name[fontFile.lang]}`,
        slug: {
          current: slugify(
            `${fontFile.fileSlug()} ${variation.name[fontFile.lang]}`,
            { lower: true }
          ),
        },
        uid: fontFile.getUid(variation.name[fontFile.lang]),
        parentUid: fontFile.getUid(),
        optionName: variation.name[fontFile.lang],
        version: fontFile.version,
        price: basePrice,
        index,
        metafields: [],
      }
      if (sanityFont && sanityFont._id) {
        // This UID lookup ALSO prevents multiple font documents from being created
        const existingVariant = (await getAllVariants()).find(
          (v) => v.uid === variant.uid
        )
        if (existingVariant) {
          variant._id = existingVariant._id
        }
      }
      for (const [key, value] of Object.entries(
        await getMetaData(fontFile, variation)
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
      variants.push(variant)
    }
  }
  // Order the variants array
  return variants.sort((a, b) => a.index - b.index)
}

export async function toSanityVariantsReference(fontFile) {
  const sanityFont = await getSanityFont(fontFile)
  const references = (await toSanityVariants(fontFile)).map((variant) => ({
    _type: 'reference',
    _weak: true,
    _ref: variant._id,
    _key: variant._id,
  }))

  // WHAT this code does is upsert variants
  // in combination with patch.set variants later on
  if (sanityFont && sanityFont._id) {
    for (const sanityVariant of sanityFont.variants.filter(Boolean)) {
      const found = references.find((v) => v._key === sanityVariant._id)
      if (!found) {
        references.push({
          _type: 'reference',
          _weak: true,
          _ref: sanityVariant._id,
          _key: sanityVariant._id,
        })
      }
    }
  }
  return references
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
