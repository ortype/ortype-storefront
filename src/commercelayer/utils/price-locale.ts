/**
 * Derives a display `PriceLocale` (EU-style vs. US-style number formatting)
 * from the visitor's `Accept-Language` header. This is intentionally decoupled
 * from the app's route locale (`i18nConfig.js`), which only controls i18n/
 * translation routing and is single-locale (`en`) with no plans to expand.
 *
 * Works identically in local dev and production, since `Accept-Language` is
 * sent by the browser itself — no Vercel-specific geo headers required.
 */

export type PriceLocale = 'de-DE' | 'en-US'

/** Request header used to forward the resolved price locale from middleware to server components. */
export const PRICE_LOCALE_HEADER = 'x-price-locale'

/** Cookie used to persist the resolved price locale across requests. */
export const PRICE_LOCALE_COOKIE = 'price-locale'

/** ISO 3166-1 alpha-2 country codes for EU member states. */
const EU_COUNTRY_CODES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
])

/**
 * Base language codes primarily associated with EU member states, used as a
 * fallback when an `Accept-Language` tag has no region subtag (e.g. `de`
 * instead of `de-DE`).
 */
const EU_LANGUAGE_CODES = new Set([
  'de',
  'fr',
  'it',
  'es',
  'nl',
  'pl',
  'cs',
  'sk',
  'hu',
  'ro',
  'bg',
  'hr',
  'sl',
  'lt',
  'lv',
  'et',
  'pt',
  'el',
  'ga',
  'sv',
  'da',
  'fi',
])

interface ParsedLanguageTag {
  tag: string
  quality: number
}

/**
 * Parse an `Accept-Language` header value into tags sorted by quality
 * (highest first). E.g. `"de-DE,de;q=0.9,en;q=0.8"` ->
 * `[{tag:'de-DE',quality:1}, {tag:'de',quality:0.9}, {tag:'en',quality:0.8}]`.
 */
function parseLanguageTags(header: string): ParsedLanguageTag[] {
  return header
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [tag, ...params] = part.split(';').map((s) => s.trim())
      const qParam = params.find((p) => p.startsWith('q='))
      const quality = qParam ? parseFloat(qParam.slice(2)) : 1
      return { tag, quality: isNaN(quality) ? 1 : quality }
    })
    .sort((a, b) => b.quality - a.quality)
}

/**
 * Resolve a display `PriceLocale` from an `Accept-Language` header value.
 * Returns `'de-DE'` (EU-style grouping/decimal formatting) when the
 * highest-priority language tag maps to an EU country or language, otherwise
 * `'en-US'`. Defensive: always returns `'en-US'` for null/empty/unparseable
 * input.
 */
export function parseAcceptLanguage(header: string | null): PriceLocale {
  if (!header) return 'en-US'

  const tags = parseLanguageTags(header)
  if (tags.length === 0) return 'en-US'

  const [primary] = tags
  const [language, region] = primary.tag.split('-')

  if (region && EU_COUNTRY_CODES.has(region.toUpperCase())) {
    return 'de-DE'
  }

  if (EU_LANGUAGE_CODES.has(language.toLowerCase())) {
    return 'de-DE'
  }

  return 'en-US'
}
