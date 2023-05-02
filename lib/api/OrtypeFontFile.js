import slugify from 'slugify'
import { nanoid } from 'nanoid'
import OrtypeAbstractFont from './OrtypeAbstractFont.js'
import {
  findByUid,
  findByUidAndVersion,
  findFontVariantByUidAndVersion,
} from 'lib/sanity.client'

import { basePrice } from 'lib/settings'

export default class OrtypeFontFile extends OrtypeAbstractFont {
  getFeatures() {
    const features = []
    for (const feature of this.instance.tables.gsub.features) {
      features[feature.tag] = feature.feature
    }
    return features
  }

  getFeatureGlyphs() {
    const features = []
    for (const lookupIndex of this.getFeatures()['aalt'].lookupListIndexes) {
      return this.instance.tables.gsub.lookups[lookupIndex].subtables[0]
        .coverage.glyphs
    }
    return features
  }

  getMetaData(variation) {
    const { usWinAscent, usWinDescent, sCapHeight } = this.instance.tables.os2

    let meta = {
      ascent: usWinAscent,
      descent: usWinDescent,
      capHeight: sCapHeight,
      familyFile: this.file,
    }
    if (variation && this.isVariable) {
      // console.log(variation)
      // console.log('variation.name[this.lang]: ', variation.name[this.lang])
      meta = {
        ...meta,
        ...{
          // these files maybe wrong because we use font name for filename which may be different
          otf: this.getOtfFile(variation.name[this.lang]),
          woff: this.getWoffFile(variation.name[this.lang]),
          woff2: this.getWoff2File(variation.name[this.lang]),
        },
      }
    } else if (!this.isVariable) {
      meta = {
        ...meta,
        ...{
          uid: variation
            ? this.getUid(this.getInfo().fontSubfamily[this.lang])
            : this.getUid(),
          // these files maybe wrong because we use font name for filename which may be different
          otf: this.getOtfFile(this.getInfo().fontSubfamily[this.lang]),
          woff: this.getWoffFile(this.getInfo().fontSubfamily[this.lang]),
          woff2: this.getWoff2File(this.getInfo().fontSubfamily[this.lang]),
        },
      }
    }

    if (this.isVariable) {
      meta.axesCount = this.getVariations().axes.length
      this.getVariations().axes.forEach((axe, index) => {
        meta[`axes${index + 1}`] = axe.tag
      })
    }
    return meta
  }

  /**
   * @TODO REACTION
   * @returns {Promise<boolean>}
   */
  async shouldUpdate() {
    return true
    // if(!this.isVariable) return false;
    // if we find the both metafields uid and version that match
    // the version and uid are constructed from data read out of the font file
    // if either of them do not exist in the product metafields, shouldUpdate
    // will return false, and will return true if they do exist
    // const product = await this.context.collections.Products.findOne({
    //   $and: [{
    //     metafields: { key: 'uid', value: this.getUid() }
    //   }, {
    //     metafields: { key: 'version', value: this.version }
    //   }]
    // })
    const product = findByUidAndVersion(this.getUid(), this.version)
    if (!product) {
      return true
    } else if (!this.isVariable) {
      return false
    }
    for (const [index, variation] of this.getVariations().instances.entries()) {
      const variant = findFontVariantByUidAndVersion(
        this.getUid(variation.name[this.lang]),
        this.version
      )
      // const variant = await this.context.collections.Products.findOne({
      //   $and: [{
      //     metafields: { key: 'uid', value: this.getUid(variation.name[this.lang]) }
      //   }, {
      //     metafields: { key: 'version', value: this.version }
      //   }]
      // })
      if (!variant) {
        return true
      }
    }
    return false
  }

  /**
   * @TODO REACTION
   *
   * @param force
   * @returns {Promise<*[]>}
   */
  // @TODO: Rename method
  async getReactionProducts(force = false) {
    const products = []
    if (!(await this.shouldUpdate()) && !force) {
      return products
    }
    const variantCount =
      this.isVariable && this.getVariations()?.instances.length
    const compareAt = variantCount ? variantCount * basePrice : 9000

    const parentProduct = {
      _id: `font-${nanoid()}`,
      _type: 'font',
      slug: { current: slugify(this.familyName, { lower: true }) },
      uid: this.getUid(),
      version: this.version,
      name: this.familyName,
      price: variantCount ? compareAt * 0.5 : compareAt,
      compareAt,
      variants: [],
      metafields: [],
    }
    for (const [key, value] of Object.entries(this.getMetaData())) {
      parentProduct.metafields.push({
        _key: nanoid(),
        key,
        value: value.toString(),
      })
    }

    if (this.isVariable) {
      // only variable font files have multiple variants
      const dupChecker = []
      for (const [
        index,
        variation,
      ] of this.getVariations().instances.entries()) {
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
            name: `${this.familyName} ${variation.name[this.lang]}`,
            slug: {
              current: slugify(
                `${this.familyName} ${variation.name[this.lang]}`,
                { lower: true }
              ),
            },
            uid: this.getUid(variation.name[this.lang]),
            parentUid: this.getUid(),
            optionName: variation.name[this.lang],
            version: this.version,
            price: basePrice,
            index,
            metafields: [],
          }
          for (const [key, value] of Object.entries(
            this.getMetaData(variation)
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
        uid: this.getUid(this.getInfo().fullName[this.lang]),
        parentUid: this.getUid(),
        name: this.getInfo().fullName[this.lang],
        slug: {
          current: slugify(this.getInfo().fullName[this.lang], { lower: true }),
        },
        optionName: this.getInfo().fontSubfamily[this.lang],
        version: this.version,
        price: basePrice,
        metafields: [],
      }
      for (const [key, value] of Object.entries(this.getMetaData(variant))) {
        variant.metafields.push({ key, value: value.toString() })
      }
      parentProduct.variants.push(variant)
    }

    return parentProduct
  }
}
