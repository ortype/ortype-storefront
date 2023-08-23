import OrtypeFont from '../api/OrtypeFont';
import { apiClient } from '../sanity.client';
import { fontfile_path } from './index'

/**
 * Initiates an instance of OrtypeFont if necessary and returns the modified items.
 *
 * @param {Array|Object} results - Items received from the Sanity CMS.
 * @returns {Promise<Array|Object>} - Processed items.
 */
const maybeInitiateOrtypeFont = async (results) => {
  // Determine if results is an array
  const isArray = Array.isArray(results);
  const items = isArray ? results : [results];

  try {
    const processedItems = await Promise.all(items.map(async item => {
      if (item._type !== 'Font' && item._type !== 'FontVariant') {
        return item;
      }

      if (!item.file_url) {
        return item;
      }

      const filepath = fontfile_path(item.file_url)

      // Initialize OrtypeFont with file_url
      item.ortype = await OrtypeFont.getInstance(filepath);
      return item;
    }));

    // Return the same structure as received
    return isArray ? processedItems : processedItems[0];
  } catch (error) {
    console.error('Error in ortype class init:', error);
    return results; // Return the original results on error
  }
};

/**
 * Fetches data from Sanity CMS and processes the results as necessary.
 *
 * @param {string} query - Sanity query.
 * @param {Object} [params={}] - Query parameters.
 * @returns {Promise<Array|Object|Boolean>} - Processed results.
 */
const sanityFetch = async (query, params = {}) => {
  try {
    const results = await apiClient.fetch(query, params);

    // Handle the possibility of an error result from Sanity
    if (results.error) {
      console.error('Error in sanity fetch response:', results.error);
      return results; // Return the original results on error
    }

    return await maybeInitiateOrtypeFont(results);
  } catch (error) {
    console.error('Error in sanity api call:', error);
    // It might be safer to return false as an error indicator,
    // as we don't have the original results at this point.
    return false;
  }
};

export default sanityFetch;
