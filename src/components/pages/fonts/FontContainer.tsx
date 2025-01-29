'use client'
import React, { createContext, useContext, ReactNode } from 'react'
import { Font } from '@/sanity/lib/queries'

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
  return <FontContext.Provider value={font}>{children}</FontContext.Provider>
}

export default FontContainer
