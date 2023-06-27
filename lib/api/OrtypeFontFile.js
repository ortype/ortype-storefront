import slugify from 'slugify'
import { nanoid } from 'nanoid'
import OrtypeAbstractFont from './OrtypeAbstractFont.js'
import {
  apiClient,
  findByUidAndVersionWithVariants
} from 'lib/sanity.client'

import { basePrice } from 'lib/settings'
import { getMetaData } from './font'

export default class OrtypeFontFile extends OrtypeAbstractFont {

  /**
   * @returns {*}
   */
  async getSanityFont(fresh = false) {
    // class cache sanity font in order to create multiple requests for an instance
    if (!this.sanityFont || fresh){
      this.sanityFont = await findByUidAndVersionWithVariants(this.getUid(), this.version)
    }
    return this.sanityFont
  }

  /**
   * @returns {Promise<boolean>}
   */
  async shouldUpdate() {
    const sanityFont = await this.getSanityFont()
    if (sanityFont){
      const fileModified = new Date(await this.modifiedAt())
      const documentModified = new Date(sanityFont._updatedAt)
      return fileModified > documentModified
    }
    return true
  }

  // this can be anywhere else, its just cool to abstract everything in fontFile
  // there is high chance on being able to run whole sync with only requirement the file path
  async maybeUpsert(){
    if (!await this.shouldUpdate()){
      return;
    }
    const transaction = apiClient.transaction()
    for (const variantDocument of await this.toSanityVariants()) {
      console.log(`variantDoc: ${variantDocument._id} ${variantDocument.name}`)
      transaction
      .createIfNotExists(variantDocument)
      .patch(variantDocument._id, (patch) => patch.set(variantDocument))
    }

    const fontDocument = await this.toSanityFont()
    transaction
    .createIfNotExists(fontDocument)
    .patch(fontDocument._id, (patch) => patch.set(fontDocument))
    .patch(fontDocument._id, (patch) =>
      patch.set({
        variants: fontDocument.variants,
      })
    )
    return await transaction.commit({ dryRun: true })
  }

  async getPrice(){
    const sanityFont = await this.getSanityFont()
    const variantCount = sanityFont ? sanityFont.variants.length : 1
    return (await this.getCompareAt()) * (variantCount ? 0.5 : 1)
  }

  async getCompareAt(){
    const sanityFont = await this.getSanityFont()
    const variantCount = sanityFont ? sanityFont.variants.length : 1
    return (variantCount ? variantCount : 1) * basePrice
  }

  async toSanityFont(){
    const sanityObject = {
      _id: `font-${nanoid()}`,
      _type: 'font',
      slug: { current: slugify(this.fileSlug(), { lower: true }) },
      uid: this.getUid(),
      version: this.version,
      name: this.familyName,
      price: await this.getPrice(),
      compareAt: await this.getCompareAt(),
      variants: await this.toSanityVariantsReference(),
      metafields: [],
      modifiedAt: await this.modifiedAt() // @TODO add in sanity fields and
    }
    const sanityFont = await this.getSanityFont()
    // This UID lookup ALSO prevents multiple font documents from being created
    if(sanityFont){
      sanityObject._id = sanityFont._id
    }

    for (const [key, value] of Object.entries(getMetaData(this))) {
      sanityObject.metafields.push({
        _key: nanoid(),
        key,
        value: value.toString(),
      })
    }
    return sanityObject
  }

  async toSanityVariants(){
    if (!this.isVariable) {
      // This is a font with a single variant
      const variant = {
        _id: `fontVariant-${nanoid()}`,
        _type: 'fontVariant',
        uid: this.getUid(this.getInfo().fullName[this.lang]),
        parentUid: this.getUid(),
        name: this.getInfo().fullName[this.lang],
        slug: {
          current: slugify(
            `${this.fileSlug()} ${this.getInfo().fullName[this.lang]}`,
            { lower: true }
          ),
        },
        optionName: this.getInfo().fontSubfamily[this.lang],
        version: this.version,
        price: basePrice,
        metafields: [],
      }
      for (const [key, value] of Object.entries(getMetaData(this, variant))) {
        variant.metafields.push({ key, value: value.toString() })
      }
      return [variant];
    }

    const sanityFont = await this.getSanityFont()
    const variants = []
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
              `${this.fileSlug()} ${variation.name[this.lang]}`,
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
        if(sanityFont){
          // This UID lookup ALSO prevents multiple font documents from being created
          const existingVariant = sanityFont.variants.find(
            (v) => v.uid === variant.uid
          )
          variant._id = existingVariant._id
        }
        for (const [key, value] of Object.entries(
          getMetaData(this, variation)
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

  async toSanityVariantsReference(){
    const sanityFont = await this.getSanityFont()
    const references = (await this.toSanityVariants()).map((variant) => ({
      _type: 'reference',
      _weak: true,
      _ref: variant._id,
      _key: variant._id,
    }))

    // WHAT this code does is upsert variants
    // in combination with patch.set variants later on
    if (sanityFont) {
      for (const sanityVariant of sanityFont.variants) {
        const found = references.find(v => v._key === sanityVariant._id)
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
}
