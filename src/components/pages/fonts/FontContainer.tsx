'use client'
import { Font } from '@/types'
import React, { createContext, ReactNode, useContext } from 'react'

// @TODO: consider moving to `components/data/` like `components/data/BuyProvider`

// Define the props type for FontContainer component
interface FontContainerProps {
  moreFonts?: Font[]
  font: Font
  children?: ReactNode
}

// Create a Context with the type Font | null
const FontContext = createContext<Font | null>(null)

// Create a custom hook to access the FontContext
export const useFont = (): Font | null => {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontContextProvider')
  }
  return context
}

const FontContainer: React.FC<FontContainerProps> = ({
  moreFonts,
  font,
  children,
}) => {
  // Filter out null variants
  // @TODO: is this not now being done in the normalizer?
  const validVariants = font?.variants.filter(
    (variant): variant is NonNullable<typeof variant> => variant !== null,
  )

  return (
    <FontContext.Provider value={{ ...font, variants: validVariants }}>
      {children}
    </FontContext.Provider>
  )
}

export default FontContainer
