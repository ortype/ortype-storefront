'use client'

import { system } from '@/@chakra-ui/theme'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {/*<ColorModeProvider {...props} />*/}
      {props.children}
    </ChakraProvider>
  )
}
