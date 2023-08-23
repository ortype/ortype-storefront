import OrtypeFont from '../api/OrtypeFont'
import { apiClient } from '../sanity.client'
import Helpers from './helpers'
import cache from './cache'
import path from 'path'

/**
 * Initiates an instance of OrtypeFont if necessary and returns the modified items.
 *
 * @param {Array|Object} results - Items received from the Sanity CMS.
 * @returns {Promise<Array|Object>} - Processed items.
 */
const maybeInitiateOrtypeFont = async (results) => {
  // Determine if results is an array
  const isArray = Array.isArray(results)
  const items = isArray ? results : [results]

  try {
    const processedItems = await Promise.all(items.map(async item => {
      if (item._type !== 'font' && item._type !== 'fontVariant') {
        return item
      }

      const file_url = (item.metafields.find(meta => meta.key === 'familyFile') || {})?.value
      if (!file_url) {
        return item
      }

      // Initialize OrtypeFont with file_url
      if (Helpers.exists(file_url)) {
        item.ortype = await cache(path.basename(file_url), () => {
          return OrtypeFont.getInstance(file_url)
        })
      }
      return item
    }))

    // Return the same structure as received
    return isArray ? processedItems : processedItems[0]
  } catch (error) {
    console.error('Error in ortype class init:', error)
    return results // Return the original results on error
  }
}

/**
 * Fetches data from Sanity CMS and processes the results as necessary.
 *
 * @param {string} query - Sanity query.
 * @param {Object} [params={}] - Query parameters.
 * @returns {Promise<Array|Object|Boolean>} - Processed results.
 */
const sanityFetch = async (query, params = {}) => {
  try {
    const results = await apiClient.fetch(query, params)

    // Handle the possibility of an error result from Sanity
    if (results.error) {
      console.error('Error in sanity fetch response:', results.error)
      return results // Return the original results on error
    }

    return await maybeInitiateOrtypeFont(results)
  } catch (error) {
    console.error('Error in sanity api call:', error)
    // It might be safer to return false as an error indicator,
    // as we don't have the original results at this point.
    return false
  }
}

export default sanityFetch
