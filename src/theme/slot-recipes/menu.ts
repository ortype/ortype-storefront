import { defineSlotRecipe } from '@chakra-ui/react'

const customContentFields = {
  bg: 'transparent',
  boxShadow: 'none',
  color: 'black',
}

const customItemFields = {
  border: '3px solid black',
  mt: '-3px',
  borderRadius: 0,
  flex: '1',
  bg: 'bg',
  width: 'max-content',
}

export const menuSlotRecipe = defineSlotRecipe({
  className: 'chakra-menu',
  slots: [
    'arrow',
    'arrowTip',
    'content',
    'contextTrigger',
    'indicator',
    'item',
    'itemGroup',
    'itemGroupLabel',
    'itemIndicator',
    'itemText',
    'positioner',
    'separator',
    'trigger',
    'triggerItem',
    'itemCommand',
  ],
  base: {
    /*    
    positioner: {
      '--y': '69px',
      '--x': '20px',
      transform: 'translate3d(var(--x), var(--y), 0)',
    },
    */
    content: {
      outline: 0,
      bg: 'bg.panel',
      boxShadow: 'lg',
      color: 'fg',
      maxHeight: 'var(--available-height)',
      '--menu-z-index': 'zIndex.dropdown',
      zIndex: 'calc(var(--menu-z-index) + var(--layer-index, 0))',
      borderRadius: 0,
      overflow: 'hidden',
      overflowY: 'auto',
      _open: {
        animationStyle: 'slide-fade-in',
        animationDuration: '0',
      },
      _closed: {
        animationStyle: 'slide-fade-out',
        animationDuration: '0',
      },
    },
    item: {
      textDecoration: 'none',
      userSelect: 'none',
      width: '100%',
      borderRadius: 'l1',
      display: 'flex',
      cursor: 'menuitem',
      alignItems: 'center',
      textAlign: 'start',
      position: 'relative',
      flex: '0 0 auto',
      outline: 0,
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    itemText: {
      flex: '1',
    },
    itemGroupLabel: {
      px: '2',
      py: '1.5',
      fontWeight: 'normal',
      textStyle: 'sm',
    },
    indicator: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: '0',
    },
    itemCommand: {
      opacity: '0.6',
      textStyle: 'xs',
      ms: 'auto',
      ps: '4',
      letterSpacing: 'widest',
    },
    separator: {
      height: '1px',
      bg: 'bg.muted',
      my: '1',
      mx: '-1',
    },
  },
  variants: {
    variant: {
      outline: {
        content: {
          gap: '0',
          bg: 'none',
          boxShadow: 'none',
          p: 0,
        },
        item: {
          justifyContent: 'flex-start',
          gap: '2',
          cursor: 'pointer',
          bg: 'brand.50',
          transition:
            'border-radius 200ms ease-in-out, box-shadow 200ms ease-in-out, background 200ms ease-in-out',
          _hover: {
            borderRadius: '100px',
          },
          _highlighted: {
            borderRadius: '100px',
            // bg: 'colorPalette.bg',
            // boxShadow: 'inset 0 0 0 2px #000',
          },
          _disabled: {
            pointerEvents: 'none',
            opacity: '0.5',
          },
        },
        trigger: {
          gap: 0,
          justifyContent: 'flex-start',
          bg: 'transparent',
          // borderWidth: '2px',
          // h: '7',
          // minW: '6',
          // textStyle: 'sm',
          // px: '2',
          // borderColor: 'colorPalette.border',
          // color: 'colorPalette.fg',
          _hover: {
            // bg: 'colorPalette.subtle',
          },
          _expanded: {
            // borderColor: 'colorPalette.fg',
          },
          borderRadius: 'full',
        },
      },
      // inline
      // for the typeface menu on /typeface route
      subtle: {
        item: {
          _highlighted: {
            bg: {
              _light: 'bg.muted',
              _dark: 'bg.emphasized',
            },
          },
        },
      },
      solid: {
        content: {
          ...customContentFields,
        },
        item: {
          ...customItemFields,
          _highlighted: {
            bg: 'black',
            color: 'white',
          },
        },
        itemText: {},
      },
      right: {
        content: {
          ...customContentFields,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        },
        item: {
          ...customItemFields,
          _highlighted: {
            bg: 'black',
            color: 'white',
          },
        },
      },
      wrap: {
        content: {
          ...customContentFields,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0',
          overflow: 'hidden',
          overflowX: 'auto',
          border: 'none',
          borderLeft: '3px solid black',
          ml: '-3px',
        },
        item: {
          ...customItemFields,
          border: '3px solid black',
          _highlighted: {
            bg: 'black',
            color: 'white',
          },
          ml: '-3px',
          flex: '0 0 auto',
        },
      },
    },
    size: {
      sm: {
        content: {
          minW: '8rem',
          padding: '1',
        },
        item: {
          gap: '1',
          textStyle: 'xs',
          py: '1',
          px: '1.5',
        },
      },
      md: {
        content: {
          mt: -1,
          minW: '8rem',
          padding: '1.5',
        },
        item: {
          gap: '2',
          textStyle: 'sm',
          py: '1.5',
          px: '2',
        },
      },
      custom: {
        content: {
          minW: 'auto',
          px: 0,
          pt: '3px',
        },
        item: {
          gap: '2',
          fontSize: '2xl',
          h: 11,
          py: '2',
          px: '2',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
})
