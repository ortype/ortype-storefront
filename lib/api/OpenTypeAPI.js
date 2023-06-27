import opentype from 'opentype.js'
import Helpers from '../utils/helpers.js'
import OrtypeFontFile from './OrtypeFontFile.js'

// This is responsible for loading files as Font Class Objects to enhance their functionality
export default class OpenTypeAPI {
  /**
   * @param options
   */
  constructor(options = {}) {
    this.options = {
      ...options
    }
    this.fonts = []
  }

  /**
   * @param options
   * @returns {Promise<OpenTypeAPI>}
   */
  static async getInstance(options = {}) {
    const object = new OpenTypeAPI(options)
    return await object.init()
  }

  /**
   * @returns {Promise<OpenTypeAPI>}
   */
  async init() {
    await this.getFonts(true)
    return this
  }

  /**
   * @param name
   * @returns OrtypeFontFile
   */
  getFont(name) {
    return this.fonts.find(font => font.name === name)
  }

  /**
   * @param reload
   * @returns {Promise<[]|*[]>}
   */
  async getFonts(reload = false) {
    if (!reload) {
      return this.fonts
    }
    for (const fontDir of Helpers.getFontDirectories()) {
      for (const fontFile of Helpers.getFontFiles(fontDir)) {
        await this.loadFont(fontFile)
      }
    }
    return this.fonts
  }

  /**
   * Internal used to load font from filesystem
   * @param fontFile
   * @returns {Promise<OpenTypeAPI>}
   */
  async loadFont(fontFile) {
    const fontName = Helpers.getPathInfo(fontFile).base
    const font = this.fonts.find(font => font.name === fontName)
    if (font) {
      font.instance = await opentype.load(fontFile)
    } else {
      const font = await OrtypeFontFile.getInstance(fontFile)
      this.fonts.push(font)
    }
    return this
  }
}
