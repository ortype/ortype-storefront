'use client'
import {
  parseAcceptLanguage,
  PRICE_LOCALE_COOKIE,
  type PriceLocale,
} from '@/commercelayer/utils/price-locale'
import { createContext, FC, useContext, useEffect, useState } from 'react'

interface PriceLocaleProviderProps {
  children: React.ReactNode
}

const DEFAULT_PRICE_LOCALE: PriceLocale = 'en-US'

export const PriceLocaleContext = createContext<PriceLocale>(
  DEFAULT_PRICE_LOCALE
)

export const usePriceLocaleContext = (): PriceLocale =>
  useContext(PriceLocaleContext)

function isPriceLocale(value: string | undefined): value is PriceLocale {
  return value === 'de-DE' || value === 'en-US'
}

function readPriceLocaleCookie(): PriceLocale | null {
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${PRICE_LOCALE_COOKIE}=`))
  const value = match?.slice(PRICE_LOCALE_COOKIE.length + 1)
  return isPriceLocale(value) ? value : null
}

/**
 * Resolves the display price locale on the client so the surrounding layout
 * doesn't need `headers()` / `cookies()` (which would force every route to
 * render dynamically).
 *
 * The first render (SSR + hydration) always uses `'en-US'` so the static HTML
 * and the hydrated markup match. After mount we switch to the locale cookie
 * set by `src/proxy.ts` (derived from Accept-Language), falling back to the
 * browser's own language list.
 */
export const PriceLocaleProvider: FC<PriceLocaleProviderProps> = ({
  children,
}) => {
  const [priceLocale, setPriceLocale] = useState<PriceLocale>(
    DEFAULT_PRICE_LOCALE
  )

  useEffect(() => {
    const resolved =
      readPriceLocaleCookie() ??
      parseAcceptLanguage(
        navigator.languages?.length
          ? navigator.languages.join(',')
          : navigator.language
      )
    setPriceLocale(resolved)
  }, [])

  return (
    <PriceLocaleContext.Provider value={priceLocale}>
      {children}
    </PriceLocaleContext.Provider>
  )
}
