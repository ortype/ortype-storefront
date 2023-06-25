import slugify from 'slugify'
import { nanoid } from 'nanoid'
import OrtypeAbstractFont from './OrtypeAbstractFont.js'
import {
  findByUid,
  findByUidAndVersion,
  findFontVariantByUidAndVersion,
} from 'lib/sanity.client'

import { basePrice } from 'lib/settings'
import { getFileMetadata } from '../utils/fileHelpers'

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

  updateSanity(){
    // parse variants
    // parse font
    // transaction
  }

}
