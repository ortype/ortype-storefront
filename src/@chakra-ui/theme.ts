import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// 2. Extend the theme to include custom colors, fonts, etc
// https://codesandbox.io/s/chakra-custom-theme-t0o2r?file=/src/index.js
/*
const customTheme = extendTheme({
    colors: {
        brand: {
            50: "#ffffff", // Lighter white
            100: "#e6e6e6",
            200: "#cccccc",
            300: "#b3b3b3",
            400: "#999999",
            500: "#808080",
            600: "#666666",
            700: "#4d4d4d",
            800: "#333333",
            900: "#000000"  // Darker black
        }
    }
});
*/

const colors = {
  brand: {
    50: { value: '#ffffff' }, // Lighter white
    100: { value: '#ffffff' },
    200: { value: '#cccccc' },
    300: { value: '#b3b3b3' },
    400: { value: '#999999' },
    500: { value: '#808080' },
    600: { value: '#000000' },
    700: { value: '#000000' },
    800: { value: '#333333' },
    900: { value: '#000000' }, // Darker black
  },
}

const globalCss = {
  html: {
    colorPalette: 'brand',
    color: '#000',
  },
  a: {
    color: '#0000FF',
  },
}

const breakpoints = {
  base: { value: '0em' }, // 0px
  sm: { value: '24em' }, // ~375px. em is a relative unit and is dependant on the font size.
  md: { value: '48em' }, // ~768px
  lg: { value: '64em' }, // ~1024px
  xl: { value: '77.5em' }, // ~1240px
  '2xl': { value: '100em' }, // ~1600px
}

// @NOTE: remember to define types with typegen
// npx @chakra-ui/cli typegen ./src/@chakra-ui/theme.ts

const config = defineConfig({
  cssVarsPrefix: 'or',
  // strictTokens: true, // only allow defined tokens (this is for production ready app)
  globalCss,
  theme: {
    tokens: {
      colors,
      breakpoints,
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.500}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
