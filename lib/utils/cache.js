/**
 * Internal store for caching data.
 * @type {Object}
 */
const cacheStore = {}

/**
 * Default expiry time in milliseconds.
 * Can be adjusted as needed.
 * @type {number}
 */
const DEFAULT_EXPIRY = 43200000 // 12 hours

/**
 * Check if the cache contains a specific key.
 * Removes the key if it has expired.
 *
 * @param {string} key - Cache key.
 * @returns {boolean} - True if the cache contains the key, false otherwise.
 */
const cache_has = (key) => {
  if (cacheStore[key] && Date.now() >= cacheStore[key].expiry) {
    delete cacheStore[key]
  }
  return cacheStore.hasOwnProperty(key)
}

/**
 * Retrieve an item from the cache.
 * If the key doesn't exist, it will return the provided fallback value.
 *
 * @param {string} key - Cache key.
 * @param {any} [fallback=undefined] - Value to return if key does not exist.
 * @returns {any} - Cached value or the fallback.
 */
const cache_get = (key, fallback = undefined) => {
  return cache_has(key) ? cacheStore[key].value : fallback
}

/**
 * Store an item in the cache with a specified expiry time.
 *
 * @param {string} key - Cache key.
 * @param {any} value - Value to cache.
 * @param {number} [expiry=DEFAULT_EXPIRY] - Expiry time in milliseconds.
 */
const cache_set = (key, value, expiry = DEFAULT_EXPIRY) => {
  cacheStore[key] = {
    value,
    expiry: Date.now() + expiry
  }
  console.log(cache_details())
}

/**
 * Remove a specific item from the cache by its key.
 *
 * @param {string} key - Cache key to remove.
 */
export const cache_forget = (key) => {
  if (cache_has(key)) {
    delete cacheStore[key]
  }
}

/**
 * Completely clears the cache, removing all keys and values.
 */
export const cache_flush = () => {
  for (let key in Object.keys(cacheStore)) {
    delete cacheStore[key]
  }
}

/**
 * Iterates over the cache and removes any items that have expired.
 */
export const cache_clear = () => {
  for (let key in Object.keys(cacheStore)) {
    if (Date.now() >= cacheStore[key].expiry) {
      delete cacheStore[key]
    }
  }
}

/**
 * Calculate the size of the cache and return its details.
 * Sizes are estimated by converting cache entries to JSON strings and then reported in MB.
 *
 * @returns {Object} - An object containing the sizes (in MB) of the entire cache, valid cache, and expired cache.
 */
export const cache_details = () => {
  const size_in_mb = (value) => {
    return (new Blob([JSON.stringify(value)]).size) / (1024 * 1024)
  }

  const { totalSize, validSize } = Object.values(cacheStore)
  .reduce((acc, entry) => {
    const entrySize = size_in_mb(entry)
    acc.totalSize += entrySize
    if (Date.now() < entry.expiry) {
      acc.validSize += entrySize
    }
    return acc
  }, { totalSize: 0, validSize: 0 })

  return {
    totalSize,
    validSize,
    expiredSize: totalSize - validSize
  }
}


/**
 * Retrieve a cached value by key, or compute, cache, and return the value if not present.
 * This version supports both synchronous and asynchronous callbacks but isn't marked with `async`.
 *
 * @param {string} key - Cache key.
 * @param {Function} callback - Callback function to compute the value if not cached. Can return a promise or a value.
 * @param {number} [expiry=DEFAULT_EXPIRY] - Expiry time in milliseconds.
 * @param {boolean} [force=false] - Force the recomputation and caching of the value even if it exists.
 * @returns {any|Promise<any>} - Cached or computed value. If computed and the callback is asynchronous, it returns a Promise.
 */
const cache = (key, callback, expiry = DEFAULT_EXPIRY, force = false) => {
  if (!force && cache_has(key)) {
    return cache_get(key)
  }

  const result = callback()
  // This will handle both promises and direct values uniformly
  if (callback instanceof Promise) {
    return result.then(result => {
      cache_set(key, result, expiry)
      return result
    })
  }
  cache_set(key, result, expiry)
  return result
}

export default cache