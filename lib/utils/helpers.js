import * as fileHelpers from './fileHelpers.js'

/**
 * @TODO REACTION
 * @param entry
 * @param key
 * @returns {undefined|*}
 */
function getMetaValue(entry, key) {
  if (!entry.metafields) return undefined
  const metafield = entry.metafields.find((meta) => meta.key === key)
  return metafield && metafield.value
}

export default {
  getMetaValue,
  ...fileHelpers
}
