import { defineSlotRecipe } from '@chakra-ui/react'

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
      bg: 'transparent',
      boxShadow: 'none',
      color: 'black',
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
      mt: '-3px',
      textDecoration: 'none',
      color: 'black',
      bg: 'white',
      border: '3px solid black',
      userSelect: 'none',
      borderRadius: 0,
      width: 'max-content',
      display: 'flex',
      cursor: 'menuitem',
      alignItems: 'center',
      textAlign: 'start',
      position: 'relative',
      flex: '1',
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
        item: {
          _highlighted: {
            bg: 'black',
            color: 'white',
          },
        },
        itemText: {},
      },
    },
    size: {
      sm: {
        content: {
          minW: '8rem',
          px: 0,
          pt: '3px',
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
          minW: 'auto',
          px: 0,
          pt: '3px',
        },
        item: {
          gap: '2',
          fontSize: '1.5rem',
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
