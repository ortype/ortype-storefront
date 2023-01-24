import OrtypeAbstractFont from './OrtypeAbstractFont.js'
import OrtypeFontFile from './OrtypeFontFile.js'
import Helpers from '../utils/helpers.js'

export default class OrtypePublishedFont extends OrtypeAbstractFont {
  constructor(catalogProduct) {
    const file = Helpers.getMetaValue(catalogProduct.product, 'familyFile')
    super(file)
    this.catalogProduct = catalogProduct
    this.variantInstances = []
  }

  static async getInstance(catalogProduct) {
    const object = new this(catalogProduct)
    return await object.init()
  }

  async init() {
    await super.init()
    await this.loadVariant()
    return this
  }

  /**
   * @TODO REACTION
   * @returns {Promise<void>}
   */
  async loadVariant() {
    for (const variant of this.catalogProduct.product.variants) {
      const variantFile = this.getOtfFile(variant.optionTitle)
      if (variantFile && Helpers.exists(variantFile)) {
        // maybe we can create OrtypePublishedFontVariant to enhance this with functions
        // that all our classes use of AbstractFont
        variant.ortypeFontFile = await OrtypeFontFile.getInstance(variantFile)
        // variant.instance = await this.loadOpenTypeFile(variantFile);
        this.variantInstances.push(variant)
      } else {
        console.error(`"${variant.title}" file not found! Expected: ${variantFile}`)
      }
    }
  }

  getVariant(variantId) {
    return this.variantInstances.find(({ _id }) => _id === variantId)
  }

  /**
   * @TODO REACTION
   * @param text
   * @param fontSize
   * @returns {{width: *, variantId: *, title: *}[]}
   */
  getWidths(text, fontSize = 1000) {
    return this.variantInstances.map(variant => {
      return {
        'title': variant.title,
        'variantId': variant._id,
        // we all like double instance key :) that's what happens to variants that do not eat their food
        'width': variant.ortypeFontFile.instance.getAdvanceWidth(text, fontSize)
      }
    })
  }
}
