import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  className: 'chakra-button',
  base: {
    display: 'inline-flex',
    appearance: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    position: 'relative',
    borderRadius: 'l2',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    borderWidth: '1px',
    borderColor: 'transparent',
    cursor: 'button',
    flexShrink: '0',
    outline: '0',
    lineHeight: '1.2',
    isolation: 'isolate',
    fontWeight: 'normal',
    transitionProperty: 'common',
    transitionDuration: 'moderate',
    focusVisibleRing: 'outside',
    _disabled: {
      layerStyle: 'disabled',
    },
    _icon: {
      flexShrink: '0',
    },
  },
  variants: {
    size: {
      '2xs': {
        h: '6',
        minW: '6',
        textStyle: 'xs',
        px: '2',
        gap: '1',
        _icon: {
          width: '3.5',
          height: '3.5',
        },
      },
      xs: {
        h: '7',
        minW: '6',
        textStyle: 'xs',
        px: '2',
        gap: '1',
        _icon: {
          width: '4',
          height: '4',
        },
      },
      sm: {
        h: '8',
        minW: '8',
        px: '2',
        textStyle: 'sm',
        gap: '2',
        _icon: {
          width: '4',
          height: '4',
        },
      },
      md: {
        h: '10',
        minW: '10',
        textStyle: 'md',
        px: '4',
        gap: '2',
        _icon: {
          width: '5',
          height: '5',
        },
      },
      lg: {
        h: '11',
        minW: '11',
        textStyle: 'md',
        px: '5',
        gap: '3',
        _icon: {
          width: '5',
          height: '5',
        },
      },
      xl: {
        h: '10',
        minW: '12',
        textStyle: 'md',
        px: '4',
        gap: '0.5',
        _icon: {
          width: '7',
          height: '7',
        },
      },
      '2xl': {
        h: '12',
        minW: '16',
        textStyle: '2xl',
        px: '5',
        gap: '3',
        _icon: {
          width: '8',
          height: '8',
        },
      },
    },
    variant: {
      solid: {
        bg: 'colorPalette.solid',
        color: 'colorPalette.contrast',
        _hover: {
          bg: 'colorPalette.solid/90',
        },
        _expanded: {
          bg: 'colorPalette.solid/90',
        },
      },
      subtle: {
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.muted',
        },
        _expanded: {
          bg: 'colorPalette.muted',
        },
      },
      surface: {
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        shadow: '0 0 0px 1px var(--shadow-color)',
        shadowColor: 'colorPalette.muted',
        _hover: {
          bg: 'colorPalette.muted',
        },
        _expanded: {
          bg: 'colorPalette.muted',
        },
      },
      outline: {
        borderWidth: '2px',
        borderColor: 'colorPalette.border',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _expanded: {
          bg: 'colorPalette.subtle',
        },
      },
      text: {
        px: 0,
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        textDecorationThickness: '2px',
        textDecorationColor: 'black',
        _hover: {
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          textDecorationColor: 'transparent',
        },
      },
      ghost: {
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _expanded: {
          bg: 'colorPalette.subtle',
        },
      },
      plain: {
        color: 'colorPalette.fg',
      },
      // custom
      rounded: {
        borderRadius: 5,
        borderWidth: '2px',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _expanded: {
          bg: 'colorPalette.subtle',
        },
      },
      block: {
        borderRadius: 0,
        borderWidth: '2px',
        borderColor: 'colorPalette.border',
        color: 'colorPalette.fg',
        _hover: {
          color: 'colorPalette.bg',
          bg: 'colorPalette.fg',
        },
        _expanded: {
          color: 'colorPalette.bg',
          bg: 'colorPalette.fg',
        },
      },
      // @TODO: perfect circle/square for these two new variants
      square: {
        borderRadius: 0,
        borderWidth: '3px',
        borderColor: 'colorPalette.border',
        px: 0,
        bg: 'white',
        color: 'colorPalette.fg',
        _hover: {
          bg: 'black',
          color: 'white',
        },
        _expanded: {
          bg: 'colorPalette.subtle',
        },
      },
      circle: {
        borderWidth: '3px',
        w: '10',
        borderColor: 'colorPalette.border',
        color: 'colorPalette.fg',
        borderRadius: '50%',
        _hover: {
          bg: 'colorPalette.subtle',
        },
        _expanded: {
          bg: 'colorPalette.subtle',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'rounded',
  },
})
