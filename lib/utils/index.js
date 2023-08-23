import path from 'path'
import cache, { cache_details } from './cache'
import { getFontFiles } from '../api/font'

const CACHE_KEY_FONTFILES = 'fontfiles'

export const fontfiles_index = () => {
  console.log(cache_details())
  return cache(CACHE_KEY_FONTFILES, () => getFontFiles()
    .reduce((acc, filepath) => {
      const basename = path.basename(filepath)
      acc[basename] = filepath
      return acc
    }, {})
  )
}

export const fontfile_path = (filepath) => {
  const index = fontfiles_index()
  const filename = path.basename(filepath)
  if (index.hasOwnProperty(filename)) {
    return index[filename]
  }
  return undefined
}
