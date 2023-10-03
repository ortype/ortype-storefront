import fs from 'fs'
import path from 'path'
import OrType from '../api/OrType'
import cache from './cache'

// export const LOCAL_DIR = 'public/'

export function checkDir(dirPath) {
  const dirInfo = path.parse(dirPath)
  if (!fs.existsSync(dirInfo.dir)) {
    fs.mkdirSync(dirInfo.dir)
  }
}

export function exists(file) {
  return fs.existsSync(file)
}

export function getFontDirectory(path) {
  const dir = `public/fonts`
  checkDir(dir)
  if (path) {
    return dir + `/${path}`
  }
  return dir
}

export function getPathInfo(source) {
  return path.parse(source)
}

export function getFontDirectories(fontName) {
  return (
    fs
      .readdirSync(getFontDirectory(), { withFileTypes: true })
      .filter((dirent) => dirent && dirent.isDirectory())
      // .filter(dirent => typeof(fontName) !== undefined ? fontName === dirent.name : true)
      .map((dirent) => dirent.name)
  )
}

export function getFontFiles(fontName) {
  return fs
    .readdirSync(getFontDirectory(fontName), { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent &&
        dirent.isFile() &&
        dirent.name &&
        (path.extname(dirent.name) === '.ttf' ||
          path.extname(dirent.name) === '.otf')
    )
    .map((dirent) => getFontDirectory(`${fontName}/${dirent.name}`))
}

export function getFileMetadata(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    })
  })
}

/**
 * Initiates an instance of OrType if necessary and returns the modified items.
 *
 * @param {Array|Object} results - Items received from the Sanity CMS.
 * @returns {Promise<Array|Object>} - Processed items.
 */
export const maybeInitiateOrType = async (results) => {
  // Determine if results is an array
  const isArray = Array.isArray(results)
  const items = isArray ? results : [results]

  try {
    const processedItems = await Promise.all(
      items.map(async (item) => {
        if (item._type !== 'font' && item._type !== 'fontVariant') {
          return item
        }

        let fileUrl = (
          item.metafields.find((meta) => meta.key === 'familyFile') || {}
        )?.value
        if (item._type === 'fontVariant') {
          // @TODO: check about using an otf file for type === fontVariant
          fileUrl = (item.metafields.find((meta) => meta.key === 'otf') || {})
            ?.value
        }

        if (!fileUrl) {
          console.log('No file URL for: ', item._id, item.name)
          return item
        }

        // Initialize OrType with fileUrl
        if (exists(fileUrl)) {
          console.log('We have a file URL for: ', item._id, item.name, fileUrl)
          item.orType = await cache(path.basename(fileUrl), () => {
            return OrType.getInstance(fileUrl)
          })
        }
        return item
      })
    )

    // Return the same structure as received
    return isArray ? processedItems : processedItems[0]
  } catch (error) {
    console.error('Error in ortype class init:', error)
    return results // Return the original results on error
  }
}

/**
 * @TODO REACTION
 * @param entry
 * @param key
 * @returns {undefined|*}
 */
export function getMetaValue(entry, key) {
  if (!entry.metafields) return undefined
  const metafield = entry.metafields.find((meta) => meta.key === key)
  return metafield && metafield.value
}
