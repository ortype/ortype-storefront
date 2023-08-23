const cacheStore = {}

/**
 * Retrieve an item from the cache.
 * @param {string} key - Cache key.
 * @param {any} value - Value to cache.
 * @param {number} [expiry=43200000] - Expiry time in milliseconds (12 hours by default).
 * @returns {any} Cached value or undefined.
 */
export const cache_get = (key, value, expiry) => {
  const cacheItem = cacheStore[key];

  if (cacheItem && (Date.now() < cacheItem.expiry)) {
    return cacheItem.value;
  } else if (value !== 'undefined') {
    cache_set(key, value, expiry)
    return cacheStore[key];
  } else if (cacheItem && (Date.now() >= cacheItem.expiry)) {
    // If the item is expired, delete it.
    delete cacheStore[key];
  }

  return undefined;
}

/**
 * @param key
 * @returns {boolean}
 */
export const cache_has = (key) => {
  return cacheStore.hasOwnProperty(key)
}

/**
 * Store an item in the cache with an expiry.
 * @param {string} key - Cache key.
 * @param {any} value - Value to cache.
 * @param {number} [expiry=43200000] - Expiry time in milliseconds (12 hours by default).
 */
export const cache_set = (key, value, expiry = 43200000) => {
  cacheStore[key] = {
    value: value,
    expiry: Date.now() + expiry
  };
}

/**
 * Remove an item from the cache.
 * @param {string} key - Cache key.
 */
export const cache_forget = (key) => {
  delete cacheStore[key];
}

// /**
//  * Retrieve or set a cache item.
//  * @param {string} key - Cache key.
//  * @param {any} [value] - Value to cache. If provided, will set the value, otherwise will retrieve.
//  * @param {number} [expiry=43200000] - Expiry time in milliseconds (12 hours by default).
//  * @returns {any|undefined} Cached value when 'value' is not provided.
//  */
// export const cache = (key, value, expiry) => {
//   if (typeof value !== 'undefined') {
//     cache_set(key, value, expiry);
//   } else {
//     return cache_get(key);
//   }
// }

/**
 * Clears the entire cache.
 */
export const cache_flush = () => {
  for (let key in cacheStore) {
    delete cacheStore[key];
  }
}

/**
 * Clears expired items from the cache.
 */
export const cache_clear = () => {
  for (let key in cacheStore) {
    if (Date.now() >= cacheStore[key].expiry) {
      delete cacheStore[key];
    }
  }
}

// Magic function using Proxy
const cache = new Proxy(cacheStore, {
  get: (target, property) => {
    switch (property) {
      case 'cache_clear':
        return cache_clear();
      case 'cache_flush':
        return cache_clear();
    }
    if (property.endsWith('_get')) {
      return () => cache_get(property.replace('_get', ''));
    }
    if (property.endsWith('_set')) {
      return (value, expiry) => cache_set(property.replace('_set', ''), value, expiry);
    }
    if (property.endsWith('_forget')) {
      return () => cache_forget(property.replace('_forget', ''));
    }
    return undefined;
  }
});

export default cache