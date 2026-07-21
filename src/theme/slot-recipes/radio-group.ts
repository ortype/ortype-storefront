import { defineSlotRecipe } from '@chakra-ui/react'

export const radioGroupSlotRecipe = defineSlotRecipe({
  className: 'chakra-radio-group',
  slots: [
    'root',
    'label',
    'item',
    'itemText',
    'itemControl',
    'indicator',
    'itemAddon',
    'itemIndicator',
  ],
  base: {
    item: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      fontWeight: 'normal',
      _disabled: {
        cursor: 'disabled',
      },
    },
    itemControl: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      verticalAlign: 'top',
      color: 'white',
      borderWidth: '1px',
      borderColor: 'transparent',
      borderRadius: 'full',
      cursor: 'radio',
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'colorPalette.focusRing',
        outlineOffset: '2px',
      },
      _invalid: {
        colorPalette: 'red',
        borderColor: 'red.500',
      },
      _disabled: {
        opacity: '0.5',
        cursor: 'disabled',
      },
      '& .dot': {
        height: '100%',
        width: '100%',
        borderRadius: 'full',
        bg: 'currentColor',
        scale: '0.4',
      },
    },
    label: {
      userSelect: 'none',
      textStyle: 'sm',
      _disabled: {
        opacity: '0.5',
      },
    },
  },
  variants: {
    variant: {
      outline: {
        item: {
          borderRadius: '0px',
          transition:
            'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out',
          boxShadow: 'inset 0 0 0 0px #000',
          bg: 'brand.50',
          _hover: {
            borderRadius: '100px',
            cursor: 'pointer',
          },
          _focus: {
            boxShadow: 'inset 0 0 0 2px #000',
          },
          _checked: {
            borderRadius: '100px',
            boxShadow: 'inset 0 0 0 2px #000',
            bg: 'colorPalette.bg',
          },
        },
        itemControl: {
          borderWidth: '2px',
          borderColor: 'colorPalette.fg',
          bg: 'colorPalette.bg',
          _checked: {
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.fg',
          },
          _hover: {
            bg: 'colorPalette.fg',
          },
          '& .dot': {
            scale: '1',
          },
        },
      },
      subtle: {
        itemControl: {
          borderWidth: '1px',
          bg: 'colorPalette.muted',
          borderColor: 'colorPalette.muted',
          color: 'transparent',
          _checked: {
            color: 'colorPalette.fg',
          },
        },
      },
      solid: {
        itemControl: {
          borderWidth: '1px',
          borderColor: 'border',
          _checked: {
            bg: 'colorPalette.solid',
            color: 'colorPalette.contrast',
            borderColor: 'colorPalette.solid',
          },
        },
      },
    },
    size: {
      xs: {
        item: {
          textStyle: 'xs',
          gap: '1.5',
        },
        itemControl: {
          boxSize: '3',
        },
      },
      sm: {
        item: {
          textStyle: 'sm',
          gap: '2',
        },
        itemControl: {
          boxSize: '4',
        },
      },
      md: {
        item: {
          textStyle: 'sm',
          gap: '2.5',
        },
        itemControl: {
          boxSize: '1.385rem',
        },
      },
      lg: {
        item: {
          textStyle: 'md',
          gap: '3',
        },
        itemControl: {
          boxSize: '6',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
})
