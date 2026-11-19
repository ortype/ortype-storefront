import useDimensionsHook from '@/components/hooks/useDimensions' // Original hook renamed to avoid naming conflict
import { useBreakpointValue } from '@chakra-ui/react'
import React, { createContext, useContext, useMemo } from 'react'
import { BOOK_PAGE } from '../specimens/specimen-sizing'
import type { DimensionsContextValue, DimensionsProviderProps } from './types'

// Create context with undefined default value for type safety
const DimensionsContext = createContext<DimensionsContextValue | undefined>(
  undefined
)

/**
 * DimensionsProvider - Provides layout-related values and responsive calculations
 * Optimized with memoization to prevent unnecessary rerenders
 */
export const DimensionsProvider = React.memo(
  ({
    targetRef,
    children,
    spreadLayout = false,
  }: DimensionsProviderProps) => {
    // Get container dimensions
    const size = useDimensionsHook(targetRef)

    // Fixed layout values
    const {
      width: pageWidth,
      height: pageHeight,
      margin: pageMargin,
      columnWidth: colWidth,
    } = BOOK_PAGE
    const ratio = pageWidth / pageHeight
    const measuredWidth = size.width ?? 0

    // Calculate responsive conversion factor
    const conversion =
      useBreakpointValue(
        {
          base: measuredWidth / pageWidth,
          lg: measuredWidth / 2 / pageWidth,
        },
        // Note: useBreakpointValue renders the fallback first
        { ssr: true }
      ) ?? 0

    // Loading state when conversion is not yet calculated
    const isLoading = !Number.isFinite(conversion) || conversion <= 0

    // Only the inner module provider opts into the exact height/width of two
    // pages. The outer header provider retains its historical spread geometry.
    const spreadAspectValue = String(
      (spreadLayout ? pageHeight / (pageWidth * 2) : ratio) * 100
    )
    const pageAspectValue = `${(1 / ratio) * 100}%`
    const paddingValue = `${pageMargin * conversion}px`
    const marginBottom = `${pageMargin * 2 * conversion}px`

    // Memoize the context value to prevent unnecessary rerenders
    const dimensionsValue = useMemo(
      () => ({
        colWidth,
        conversion,
        isLoading,
        spreadAspectValue,
        spreadAspect: `${spreadAspectValue}%`,
        pageAspect: pageAspectValue,
        padding: paddingValue,
        marginBottom,
        size,
      }),
      [
        marginBottom,
        colWidth,
        conversion,
        isLoading,
        spreadAspectValue,
        pageAspectValue,
        paddingValue,
        size,
      ]
    )

    return (
      <DimensionsContext.Provider value={dimensionsValue}>
        {children}
      </DimensionsContext.Provider>
    )
  }
)

DimensionsProvider.displayName = 'DimensionsProvider'

/**
 * useDimensions - Hook for consuming the dimensions context
 * Provides type-safe access to layout values
 */
export const useDimensions = (): DimensionsContextValue => {
  const context = useContext(DimensionsContext)

  if (context === undefined) {
    throw new Error('useDimensions must be used within a DimensionsProvider')
  }

  return context
}

export default DimensionsContext
