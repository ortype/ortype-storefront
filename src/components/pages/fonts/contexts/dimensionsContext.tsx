import useDimensionsHook from '@/components/hooks/useDimensions' // Original hook renamed to avoid naming conflict
import { useBreakpointValue } from '@chakra-ui/react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { DimensionsContextValue, DimensionsProviderProps } from './types'

// Helper functions for responsive calculations
function isObject(value: any): value is Record<string, any> {
  const type = typeof value
  return (
    value != null &&
    (type === 'object' || type === 'function') &&
    !Array.isArray(value)
  )
}

function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value)
}

function mapResponsive(prop: any, mapper: (val: any) => any) {
  if (isArray(prop)) {
    return prop.map((item) => (item === null ? null : mapper(item)))
  }

  if (isObject(prop)) {
    return Object.keys(prop).reduce((result: Record<string, any>, key) => {
      result[key] = mapper(prop[key])
      return result
    }, {})
  }

  if (prop != null) {
    return mapper(prop)
  }

  return null
}

// Create context with undefined default value for type safety
const DimensionsContext = createContext<DimensionsContextValue | undefined>(
  undefined
)

/**
 * DimensionsProvider - Provides layout-related values and responsive calculations
 * Optimized with memoization to prevent unnecessary rerenders
 */
export const DimensionsProvider: React.FC<DimensionsProviderProps> = React.memo(
  ({ targetRef, children }) => {
    // Get container dimensions
    const size = useDimensionsHook(targetRef)

    // Fixed layout values
    const pageWidth = 680
    const pageHeight = 930
    const pageMargin = 46
    const colWidth = 558
    const ratio = pageWidth / pageHeight

    // Calculate responsive conversion factor
    const conversion = useBreakpointValue(
      {
        base: size?.width / pageWidth,
        lg: size?.width / 2 / pageWidth,
      },
      // Note: useBreakpointValue renders the fallback first
      { ssr: true } // `ssr: false` would produce "window is not defined" in nextjs
    )

    // Loading state when conversion is not yet calculated
    const isLoading = isNaN(conversion)

    // Calculate derived values only when inputs change
    const spreadAspectValue = useMemo(
      () => mapResponsive(ratio, (r) => `${(r / 1) * 100}`),
      [ratio]
    )

    const pageAspectValue = useMemo(
      () => mapResponsive(ratio, (r) => `${(1 / r) * 100}%`),
      [ratio]
    )

    const paddingValue = useMemo(
      () => `${pageMargin * conversion}px`,
      [pageMargin, conversion]
    )

    const marginBottom = useMemo(
      () => `${pageMargin * 2 * conversion}px`,
      [pageMargin, conversion]
    )

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
