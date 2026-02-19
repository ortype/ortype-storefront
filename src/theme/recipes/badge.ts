import { defineRecipe } from '@chakra-ui/react'

export const badgeRecipe = defineRecipe({
  className: 'chakra-badge',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'none',
    gap: '1',
    fontWeight: 'normal',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  variants: {
    variant: {
      solid: {
        bg: 'brand.50', // 'colorPalette.solid',
        color: 'colorPalette.fg', // 'colorPalette.contrast',
      },
      subtle: {
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
      },
      outline: {
        color: '#0000FF', // 'colorPalette.fg',
        shadow: 'inset 0 0 0px 1px var(--shadow-color)',
        shadowColor: '#0000FF', // 'colorPalette.muted',
      },
      surface: {
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        shadow: 'inset 0 0 0px 1px var(--shadow-color)',
        shadowColor: 'colorPalette.muted',
      },
      plain: {
        color: 'colorPalette.fg',
      },
    },
    size: {
      xs: {
        textStyle: '2xs',
        px: '1',
        minH: '4',
      },
      sm: {
        textStyle: 'xs',
        px: '1.5',
        minH: '5',
      },
      md: {
        textStyle: 'sm',
        px: '2',
        minH: '6',
      },
      lg: {
        textStyle: 'sm',
        px: '2.5',
        minH: '7',
      },
    },
  },
  defaultVariants: {
    variant: 'subtle',
    size: 'sm',
  },
})
