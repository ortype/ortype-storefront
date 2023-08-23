import opentype from 'opentype.js'
import Helpers from '../utils/helpers.js'
import { getFileMetadata } from '../utils/fileHelpers'

export default class OrtypeFont {
  /**
   * @param {String} file
   */
  constructor(file) {
    this.lang = 'en'
    this.file = file
    this.name = Helpers.getPathInfo(file).name
    this.instance = undefined
  }

  /**
   * Abstract instantiate any class inheriting this one
   * @param file
   * @returns {Promise<this>}
   */
  static async getInstance(file) {
    const object = new this(file)
    return await object.init()
  }

  /**
   * Initialize all variables needed to identify a font file as an object/class
   * @returns {Promise<this>}
   */
  async init() {
    this.instance = await opentype.load(this.file)
    this.familyName = this.getInfo().fontFamily[this.lang]
    this.version = this.getInfo().version[this.lang].replace('Version ', '')
    const subVersions = this.version.split('.')
    this.majorVersion = subVersions[0]
    subVersions.shift()
    this.minorVersion = subVersions.join('.')
    this.isVariable = this.getVariations()
    return this
  }

  /**
   * @returns {Promise<Date>}
   */
  async modifiedAt(){
    const meta = await getFileMetadata(this.file)
    return meta?.mtime;
  }

  /**
   * @param file
   * @returns {Promise<*>}
   */
  async loadOpenTypeFile(file) {
    return await opentype.load(file)
  }

  /**
   * Helper function returning fvar table
   * @returns {*}
   */
  getVariations() {
    return this.instance.tables.fvar
  }

  /**
   * Helper function returning name table
   * @returns {*}
   */
  getInfo() {
    return this.instance.tables.name
  }

  /**
   * Helper function returning font glyphs
   * @returns {*}
   */
  getGlyphs() {
    return this.instance.glyphs
  }

  /**
   * Helper function used to get a font's Unique Identifier
   * @returns {*}
   */
  getUid(uidAppend = undefined) {
    return (
      [this.familyName, this.majorVersion].join(' v') +
      (uidAppend ? `-${uidAppend}` : '')
    )
  }

  fileSlug(){
    // The regular expression `/.*\/([^\/]*)\.(ttf|otf)/` matches any characters (`.*`) followed by a forward slash (`\/`), then captures any non-forward slash characters (`[^\/]*`) until it reaches either the `.ttf` or `.otf` extension (`\.(ttf|otf)`)
    return this.file.match(/.*\/([^\/]*)\.(ttf|otf)/)[1]
  }

  getOtfFile(variationName) {
    return Helpers.getFontDirectory(
      `${this.familyName.replace(/ /g, '')}/otf/${this.familyName.replace(
        / /g,
        ''
      )}-${variationName.replace(/ /g, '')}.otf`
    )
  }

  getWoffFile(variationName) {
    return Helpers.getFontDirectory(
      `${this.familyName.replace(/ /g, '')}/woff/${this.familyName.replace(
        / /g,
        ''
      )}-${variationName.replace(/ /g, '')}.woff`
    )
  }

  getWoff2File(variationName) {
    return Helpers.getFontDirectory(
      `${this.familyName.replace(/ /g, '')}/woff2/${this.familyName.replace(
        / /g,
        ''
      )}-${variationName.replace(/ /g, '')}.woff2`
    )
  }
  
  getSpaceWidth(fontSize) {
    const width = this.instance.getAdvanceWidth(" ", 1000);
    if (width) {
      return width * fontSize / 1000;
    }
    return 0;
  }

  getWordWidth(word, fontSize) {
    const width = this.instance.getAdvanceWidth(word, 1000);
    if (width) {
      return width * fontSize / 1000;
    }
    return 0;
  }
}
