import { defineSlotRecipe } from '@chakra-ui/react'

export const checkboxSlotRecipe = defineSlotRecipe({
  slots: ['root', 'label', 'control', 'indicator', 'group'],
  className: 'chakra-checkbox',
  base: {
    root: {
      display: 'inline-flex',
      gap: '2',
      alignItems: 'center',
      verticalAlign: 'top',
      position: 'relative',
    },
    control: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
      color: 'white',
      borderWidth: '1px',
      borderColor: 'transparent',
      borderRadius: 'l1',
      focusVisibleRing: 'outside',
      _icon: {
        boxSize: 'full',
      },
      _invalid: {
        colorPalette: 'red',
        borderColor: 'border.error',
      },
      _disabled: {
        opacity: '0.5',
      },
    },
    label: {
      fontWeight: 'normal',
      userSelect: 'none',
      _disabled: {
        opacity: '0.5',
      },
    },
  },
  variants: {
    size: {
      xs: {
        root: {
          gap: '1.5',
        },
        label: {
          textStyle: 'xs',
        },
        control: {
          boxSize: '3',
        },
      },
      sm: {
        root: {
          gap: '2',
        },
        label: {
          textStyle: 'sm',
        },
        control: {
          boxSize: '4',
        },
      },
      md: {
        root: {
          gap: '2.5',
        },
        label: {
          textStyle: 'sm',
        },
        control: {
          boxSize: '1.385rem',
          p: '0.5',
        },
      },
      lg: {
        root: {
          gap: '3',
        },
        label: {
          textStyle: 'md',
        },
        control: {
          boxSize: '6',
          p: '0.5',
        },
      },
    },
    variant: {
      outline: {
        root: {
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
        control: {
          bg: 'colorPalette.bg',
          borderRadius: 'full',
          borderWidth: '2px',
          borderColor: 'colorPalette.fg',
          _hover: {
            borderWidth: '3px',
          },
          '&:is([data-state=checked], [data-state=indeterminate])': {
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.fg',
            bg: 'colorPalette.fg',
          },
        },
      },
      solid: {
        control: {
          borderColor: 'border',
          '&:is([data-state=checked], [data-state=indeterminate])': {
            bg: 'blackAlpha.300',
            color: 'colorPalette.contrast',
            borderColor: 'colorPalette.solid',
          },
        },
      },
      subtle: {
        control: {
          bg: 'colorPalette.muted',
          borderColor: 'colorPalette.muted',
          '&:is([data-state=checked], [data-state=indeterminate])': {
            color: 'colorPalette.fg',
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
})
