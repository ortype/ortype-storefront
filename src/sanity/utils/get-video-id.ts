/**
 * Strip away any remaining parameters following `?` or `/` or '&' for YouTube shortcode strings.
 *
 * @note this function is not meant to work with url strings containing a protocol like https://
 * @param {String} shortcodeString - the parameter string
 * @returns {String}
 */
function stripParameters(shortcodeString) {
  // Split parameters or split folder separator
  if (shortcodeString.includes('?')) {
    shortcodeString = shortcodeString.split('?')[0]
  }

  if (shortcodeString.includes('/')) {
    shortcodeString = shortcodeString.split('/')[0]
  }

  if (shortcodeString.includes('&')) {
    shortcodeString = shortcodeString.split('&')[0]
  }

  return shortcodeString
}

/**
 * Get the Youtube Video id.
 * @param {string} youtubeStr - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function youtube(youtubeString) {
  let string_ = youtubeString

  // Remove the '-nocookie' flag from youtube urls
  string_ = string_.replace('-nocookie', '')

  // Remove time hash at the end of the string
  string_ = string_.replace(/#t=.*$/, '')

  // Strip the leading protocol
  string_ = string_.replace(/^https?:\/\//, '')

  // Shortcode
  const shortcode = /youtube:\/\/|youtu\.be\/|y2u\.be\//g

  if (shortcode.test(string_)) {
    const shortcodeid = string_.split(shortcode)[1]
    return stripParameters(shortcodeid)
  }

  // Shorts
  const shortsUrl = /\/shorts\//g
  if (shortsUrl.test(string_)) {
    return stripParameters(string_.split(shortsUrl)[1])
  }

  // V= or vi=
  const parameterv = /v=|vi=/g

  if (parameterv.test(string_)) {
    const array = string_.split(parameterv)
    return stripParameters(array[1].split('&')[0])
  }

  // /v/ or /vi/ or /watch/
  const inlinev = /\/v\/|\/vi\/|\/watch\//g

  if (inlinev.test(string_)) {
    const inlineid = string_.split(inlinev)[1]
    return stripParameters(inlineid)
  }

  // Format an_webp
  const parameterwebp = /\/an_webp\//g

  if (parameterwebp.test(string_)) {
    const webp = string_.split(parameterwebp)[1]
    return stripParameters(webp)
  }

  // /e/
  const eformat = /\/e\//g

  if (eformat.test(string_)) {
    const estring = string_.split(eformat)[1]
    return stripParameters(estring)
  }

  // Embed
  const embedreg = /\/embed\//g

  if (embedreg.test(string_)) {
    const embedid = string_.split(embedreg)[1]
    return stripParameters(embedid)
  }

  // ignore /user/username pattern
  const usernamereg = /\/user\/([a-zA-Z\d]*)$/g

  if (usernamereg.test(string_)) {
    return undefined
  }

  // User
  const userreg = /\/user\/(?!.*videos)/g

  if (userreg.test(string_)) {
    const elements = string_.split('/')
    return stripParameters(elements.pop())
  }

  // Attribution_link
  const attrreg = /\/attribution_link\?.*v%3D([^%&]*)(%26|&|$)/

  if (attrreg.test(string_)) {
    return stripParameters(string_.match(attrreg)[1])
  }

  // Live
  const livereg = /\/live\//g

  if (livereg.test(string_)) {
    const liveid = string_.split(livereg)[1]
    return stripParameters(liveid)
  }

  return undefined
}

/**
 * Get the vimeo id.
 *
 * @param {String} vimeoString the url from which you want to extract the id
 * @returns {String|undefined}
 */
function vimeo(vimeoString) {
  let string_ = vimeoString

  if (string_.includes('#')) {
    ;[string_] = string_.split('#')
  }

  if (string_.includes('?') && !string_.includes('clip_id=')) {
    ;[string_] = string_.split('?')
  }

  let id
  let array

  const event = /https?:\/\/vimeo\.com\/event\/(\d+)$/

  const eventMatches = event.exec(string_)

  if (eventMatches && eventMatches[1]) {
    return eventMatches[1]
  }

  const primary = /https?:\/\/vimeo\.com\/(\d+)/

  const matches = primary.exec(string_)
  if (matches && matches[1]) {
    return matches[1]
  }

  const vimeoPipe = [
    'https?://player.vimeo.com/video/[0-9]+$',
    'https?://vimeo.com/channels',
    'groups',
    'album',
  ].join('|')

  const vimeoRegex = new RegExp(vimeoPipe, 'gim')

  if (vimeoRegex.test(string_)) {
    array = string_.split('/')
    if (array && array.length > 0) {
      id = array.pop()
    }
  } else if (/clip_id=/gim.test(string_)) {
    array = string_.split('clip_id=')
    if (array && array.length > 0) {
      ;[id] = array[1].split('&')
    }
  }

  return id
}

/**
 * Extract the url query parameter from a Google redirect url.
 *
 * @example
 * ```javascript
 * const url = extractGoogleRedirectionUrl('https://www.google.cz/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0ahUKEwj30L2MvpDVAhUFZVAKHb8CBaYQuAIIIjAA&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ')
 * // => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
 * ```
 * @param {String} input
 * @returns {String}
 */
function extractGoogleRedirectionUrl(input) {
  if (typeof input !== 'string') {
    throw new TypeError(
      `extractGoogleRedirectionUrl expected a string, got ${typeof input}`
    )
  }

  const string_ = input.trim()

  // Try to handle google redirection uri
  if (/\/\/google|www\.google/.test(string_)) {
    try {
      const urlObject = new URL(input)

      const parameters = new URLSearchParams(urlObject.search)
      const extractedUrl = parameters.get('url')

      if (extractedUrl) {
        return decodeURIComponent(extractedUrl)
      }
    } catch {
      // If there's an error (e.g., input is not a valid URL), return the trimmed input
      return string_
    }
  }

  return string_
}

/**
 * Get the value assigned to a "src" attribute in a string, or undefined.
 * @param {String} input
 * @returns {String|undefined}
 */
function getSrc(input) {
  if (typeof input !== 'string') {
    throw new TypeError('getSrc expected a string')
  }

  const srcRegEx = /src="(.*?)"/gm
  const matches = srcRegEx.exec(input)

  if (matches && matches.length >= 2) {
    return matches[1]
  }

  return undefined
}

/**
 * Prepare the URL by doing common cleanup operations common for all URL types.
 * @param {String} input
 * @returns {String}
 */
function sanitizeUrl(input) {
  if (typeof input !== 'string') {
    throw new TypeError(`sanitizeUrl expected a string, got ${typeof input}`)
  }

  let string_ = input

  if (/<iframe/gi.test(string_)) {
    string_ = getSrc(string_) || ''
  }

  // Remove surrounding whitespaces or linefeeds
  string_ = string_.trim()

  // Remove any leading `www.`
  string_ = string_.replace('/www.', '/')

  return string_
}

/**
 * Get the id and service from a video url.
 * @param {String} urlString - the url from which you want to extract the id
 * @returns {Object}
 */
function getVideoId(urlString) {
  if (typeof urlString !== 'string') {
    throw new TypeError('get-video-id expects a string')
  }

  const string_ = sanitizeUrl(urlString)
  const url = extractGoogleRedirectionUrl(string_)

  let metadata = {
    id: undefined,
    service: undefined,
  }

  if (/youtube|youtu\.be|y2u\.be|i.ytimg\./.test(url)) {
    metadata = {
      id: youtube(url),
      service: 'youtube',
    }
  } else if (/vimeo/.test(url)) {
    metadata = {
      id: vimeo(url),
      service: 'vimeo',
    }
  }

  return metadata
}

export default getVideoId
