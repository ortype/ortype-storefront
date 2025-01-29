/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')
import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'

module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/sanity/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js, jsx, ts,tsx}',
  ],
  theme: {
    container: {
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
      },
    },
    colors: {
      primary: {
        light: 'var(--primary-light)',
        DEFAULT: 'var(--primary)',
        dark: 'var(--primary-dark)',
      },
      contrast: 'var(--contrast)',
      transparent: 'transparent',
      black: '#101111',
      white: '#fff',
      gray: {
        // 100: "#f8f8f8",
        // 300: "#E6E6E6",
        // 400: "#C4C4C4",
        // 500: "#8D8D8D",
        // 600: "#666666",
        50: '#f8f8f8',
        100: '#EDEEEE',
        200: '#E6E7E7',
        300: '#DBDCDC',
        400: '#878888',
        500: '#686E6E',
        600: '#404141',
        700: '#343535',
        800: '#282929',
        900: '#1D1E1E',
      },
      red: {
        50: '#ffe0e1',
        400: '#FF656B',
        500: '#cc5156',
      },
      green: {
        400: '#1FDA8A',
      },
      orange: {
        400: '#FFAB2E',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      colors: {
        'accent-1': '#FAFAFA',
        'accent-2': '#EAEAEA',
        'accent-7': '#333',
        success: '#0070f3',
        cyan: '#79FFE1',
        'blue-500': '#2276FC',
        'yellow-100': '#fef7da',
      },
      spacing: {
        28: '7rem',
      },
      letterSpacing: {
        tighter: '-.04em',
      },
      lineHeight: {
        tight: 1.2,
      },
      fontSize: {
        '5xl': '2.5rem',
        '6xl': '2.75rem',
        '7xl': '4.5rem',
        '8xl': '6.25rem',
      },
      boxShadow: {
        small: '0 5px 10px rgba(0, 0, 0, 0.12)',
        medium: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  variants: {
    extend: {
      textColor: ['group-focus'],
      maxHeight: ['group-focus'],
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    typography,
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} satisfies Config
