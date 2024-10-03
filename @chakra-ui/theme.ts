import {
  defineStyle,
  defineStyleConfig,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react'

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
    50: '#ffffff', // Lighter white
    100: '#ffffff',
    200: '#cccccc',
    300: '#b3b3b3',
    400: '#999999',
    500: '#808080',
    600: '#000000',
    700: '#000000',
    800: '#333333',
    900: '#000000', // Darker black
  },
  gray: {
    600: '#000000',
  },
}

const styles = {
  global: {
    'html, body': {
      color: '#000',
    },
    a: {
      color: '#0000FF',
    },
  },
}

const breakpoints = {
  base: '0em', // 0px
  sm: '24em', // ~375px. em is a relative unit and is dependant on the font size.
  md: '48em', // ~768px
  lg: '64em', // ~1024px
  xl: '77.5em', // ~1240px
  '2xl': '100em', // ~1600px
}

const theme = {
  config: {
    // initialColorMode: 'light',
  },
  colors,
  styles,
  breakpoints,
}

export default extendTheme(
  theme,
  withDefaultColorScheme({ colorScheme: 'brand' })
)
