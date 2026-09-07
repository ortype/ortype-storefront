'use client'
import type { PriceLocale } from '@/commercelayer/utils/price-locale'
import { createContext, FC, useContext } from 'react'

interface PriceLocaleProviderProps {
  /** Server-resolved price locale, derived from the visitor's Accept-Language
   * header in `src/proxy.ts`. There is no client-side re-detection — this
   * avoids hydration mismatches, since Accept-Language isn't available
   * client-side. */
  priceLocale: PriceLocale
  children: React.ReactNode
}

export const PriceLocaleContext = createContext<PriceLocale>('en-US')

export const usePriceLocaleContext = (): PriceLocale =>
  useContext(PriceLocaleContext)

export const PriceLocaleProvider: FC<PriceLocaleProviderProps> = ({
  priceLocale,
  children,
}) => (
  <PriceLocaleContext.Provider value={priceLocale}>
    {children}
  </PriceLocaleContext.Provider>
)
