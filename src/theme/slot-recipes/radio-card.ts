import { defineSlotRecipe } from '@chakra-ui/react'

export const radioCardSlotRecipe = defineSlotRecipe({
  className: 'chakra-radio-card',
  slots: [
    'root',
    'label',
    'item',
    'itemText',
    'itemControl',
    'indicator',
    'itemAddon',
    'itemIndicator',
    'itemContent',
    'itemDescription',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      isolation: 'isolate',
    },
    item: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      position: 'relative',
      borderRadius: 'l2',
      cursor: 'pointer',
      _focus: {
        bg: 'colorPalette.muted/20',
      },
      _disabled: {
        opacity: '0.8',
        borderColor: 'border.disabled',
      },
      _checked: {
        zIndex: '1',
      },
    },
    label: {
      display: 'inline-flex',
      fontWeight: 'normal',
      textStyle: 'lg',
      _disabled: {
        opacity: '0.5',
      },
    },
    itemText: {
      fontWeight: 'normal',
    },
    itemDescription: {
      // opacity: '0.64',
      textStyle: 'xs',
    },
    itemControl: {
      display: 'inline-flex',
      flex: '1',
      pos: 'relative',
      rounded: 'inherit',
      justifyContent: 'var(--radio-card-justify)',
      alignItems: 'var(--radio-card-align)',
      _disabled: {
        bg: 'bg.muted',
      },
    },
    itemIndicator: {
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
        scale: '1',
      },
    },
    itemAddon: {
      roundedBottom: 'inherit',
      _disabled: {
        color: 'fg.muted',
      },
    },
    itemContent: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
      gap: '0',
      justifyContent: 'var(--radio-card-justify)',
      alignItems: 'var(--radio-card-align)',
    },
  },
  variants: {
    size: {
      sm: {
        item: {
          textStyle: 'sm',
        },
        itemControl: {
          padding: '3',
          gap: '1.5',
        },
        itemAddon: {
          px: '3',
          py: '1.5',
          borderTopWidth: '1px',
        },
        itemIndicator: {
          boxSize: '4',
        },
      },
      md: {
        item: {
          textStyle: 'xl',
        },
        itemControl: {
          padding: '4',
          gap: '2.5',
        },
        itemAddon: {
          px: '4',
          py: '2',
          borderTopWidth: '1px',
        },
        itemIndicator: {
          boxSize: '1.385rem',
        },
      },
      lg: {
        item: {
          textStyle: 'xl',
        },
        itemControl: {
          padding: '4',
          gap: '3.5',
        },
        itemAddon: {
          px: '4',
          py: '2',
          borderTopWidth: '1px',
        },
        itemIndicator: {
          boxSize: '6',
        },
      },
    },
    variant: {
      surface: {
        item: {
          borderWidth: '1px',
          _checked: {
            bg: 'colorPalette.subtle',
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.muted',
          },
        },
        itemIndicator: {
          borderWidth: '1px',
          borderColor: 'border',
          _checked: {
            bg: 'colorPalette.solid',
            color: 'colorPalette.contrast',
            borderColor: 'colorPalette.solid',
          },
        },
      },
      subtle: {
        item: {
          border: 'none',
          bg: 'brand.50',
          borderRadius: '0px',
          transition:
            'border-radius 200ms ease-in-out, background 200ms ease-in-out',
          _hover: {
            bg: '#e3e3e3',
            opacity: 1,
            borderRadius: '100px',
            '& .dot': {
              borderWidth: '3px',
            },
          },
          opacity: 1,
          _checked: {
            borderRadius: '100px',
            _hover: {
              bg: '#e3e3e3',
              '& .dot': {
                borderWidth: 0,
              },
            },
            opacity: 1,
          },
        },
        itemControl: {
          alignItems: 'center',
          _checked: {
            opacity: 1,
            bg: 'blackAlpha.300',
            color: 'colorPalette.fg',
          },
        },
        itemIndicator: {
          borderWidth: '2px',
          borderColor: 'colorPalette.fg',
          bg: 'colorPalette.bg',
          _checked: {
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.fg',
          },
          '& .dot': {
            scale: '1',
          },
        },
      },
      outline: {
        item: {
          border: 'none',
          bg: 'colorPalette.bg',
          borderRadius: '0px',
          transition:
            'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out',
          _hover: {
            bg: '#f4f4f4',
            borderRadius: '100px',
            '& .dot': {
              borderWidth: '3px',
            },
          },
          _checked: {
            borderColor: 'transparent',
            boxShadow: 'none',
            borderRadius: '100px',
            _hover: {
              bg: '#f4f4f4',
              '& .dot': {
                borderWidth: 0,
              },
            },
          },
        },
        itemControl: {
          alignItems: 'center',
          _checked: {
            opacity: 1,
            boxShadow: 'inset 0 0 0 2px #000',
            bg: 'colorPalette.bg',
            color: 'colorPalette.fg',
          },
        },
        itemIndicator: {
          borderWidth: '2px',
          borderColor: 'colorPalette.fg',
          bg: 'colorPalette.bg',
          _focusVisible: {
            outlineColor: 'transparent',
          },
          _checked: {
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.fg',
          },
          '& .dot': {
            scale: '1',
          },
        },
      },
      solid: {
        item: {
          rounded: 0,
          borderWidth: '0px',
          bg: 'brand.50',
          _checked: {
            bg: '#e3e3e3',
            color: 'colorPalette.fg',
            borderColor: 'transparent',
            _hover: {
              '& .dot': {
                borderWidth: 0,
              },
            },
          },
          _hover: {
            bg: '#e3e3e3',
            '& .dot': {
              borderWidth: '3px',
            },
          },
        },
        itemControl: {
          gap: 4,
          pb: 0,
        },
        itemIndicator: {
          borderWidth: '2px',
          borderColor: 'colorPalette.fg',
          bg: 'colorPalette.bg',
          _focusVisible: {
            outlineColor: 'transparent',
          },
          _checked: {
            color: 'colorPalette.fg',
            borderColor: 'colorPalette.fg',
          },
          '& .dot': {
            scale: '1',
          },
        },
        itemAddon: {
          display: 'flex',
          flexDirection: 'row',
          borderColor: 'transparent',
          px: 4,
          pt: 2,
          pb: 2,
          justifyContent: 'flex-end',
        },
      },
    },
    justify: {
      start: {
        item: {
          '--radio-card-justify': 'flex-start',
        },
      },
      end: {
        item: {
          '--radio-card-justify': 'flex-end',
        },
      },
      center: {
        item: {
          '--radio-card-justify': 'center',
        },
      },
    },
    align: {
      start: {
        item: {
          '--radio-card-align': 'flex-start',
        },
        itemControl: {
          textAlign: 'start',
        },
      },
      end: {
        item: {
          '--radio-card-align': 'flex-end',
        },
        itemControl: {
          textAlign: 'end',
        },
      },
      center: {
        item: {
          '--radio-card-align': 'center',
        },
        itemControl: {
          textAlign: 'center',
        },
      },
    },
    orientation: {
      vertical: {
        itemControl: {
          flexDirection: 'column',
        },
      },
      horizontal: {
        itemControl: {
          flexDirection: 'row',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
    align: 'start',
    orientation: 'horizontal',
  },
})
