import { defineSlotRecipe } from '@chakra-ui/react'

export const selectSlotRecipe = defineSlotRecipe({
  className: 'chakra-select',
  slots: [
    'label',
    'positioner',
    'trigger',
    'indicator',
    'clearTrigger',
    'item',
    'itemText',
    'itemIndicator',
    'itemGroup',
    'itemGroupLabel',
    'list',
    'content',
    'root',
    'control',
    'valueText',
    'indicatorGroup',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      width: 'auto',
    },
    trigger: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      whiteSpace: 'nowrap',
      minH: 'var(--select-trigger-height)',
      px: 'var(--select-trigger-padding-x)',
      borderRadius: 'none',
      userSelect: 'none',
      textAlign: 'start',
      focusVisibleRing: 'inside',
      _placeholderShown: {
        color: 'fg.muted',
      },
      _disabled: {
        layerStyle: 'disabled',
      },
      _invalid: {
        borderColor: 'border.error',
      },
    },
    indicatorGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      pos: 'absolute',
      right: '0',
      top: '0',
      bottom: '0',
      px: 'var(--select-trigger-padding-x)',
      pointerEvents: 'none',
    },
    indicator: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: {
        base: 'fg.muted',
        _disabled: 'fg.subtle',
        _invalid: 'fg.error',
      },
    },
    content: {
      background: 'bg.panel',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 'dropdown',
      borderRadius: 'none',
      outline: 0,
      maxH: '96',
      overflowY: 'auto',
      boxShadow: 'md',
      _open: {
        animationStyle: 'slide-fade-in',
        animationDuration: 'fast',
      },
      _closed: {
        animationStyle: 'slide-fade-out',
        animationDuration: 'fastest',
      },
    },
    item: {
      position: 'relative',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      cursor: 'option',
      justifyContent: 'space-between',
      flex: '1',
      textAlign: 'start',
      borderRadius: 'l1',
      _highlighted: {
        bg: {
          _light: 'bg.muted',
          _dark: 'bg.emphasized',
        },
      },
      _disabled: {
        pointerEvents: 'none',
        opacity: '0.5',
      },
      _icon: {
        width: '4',
        height: '4',
      },
    },
    control: {
      pos: 'relative',
    },
    itemText: {
      flex: '1',
    },
    itemGroup: {
      _first: {
        mt: '0',
      },
    },
    itemGroupLabel: {
      py: '1',
      fontWeight: 'normal',
    },
    label: {
      fontWeight: 'normal',
      userSelect: 'none',
      textStyle: 'sm',
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    valueText: {
      lineClamp: '1',
      maxW: '100%',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    variant: {
      outline: {
        trigger: {
          bg: 'transparent',
          borderWidth: '1px',
          borderColor: 'border',
          _expanded: {
            borderColor: 'border.emphasized',
          },
        },
      },
      subtle: {
        trigger: {
          borderWidth: '1px',
          borderColor: 'transparent',
          bg: 'brand.50',
        },
        content: {
          bg: 'brand.50',
          boxShadow: 'none',
        },
      },
      flushed: {
        root: {
          // bg: 'transparent',
          borderBottomWidth: '2px',
          borderBottomColor: 'brand.border',
          borderRadius: '0',
          px: '0',
          _focusVisible: {
            borderColor: 'var(--focus-color)',
            boxShadow: '0px 1px 0px 0px var(--focus-color)',
          },
        },
        content: {
          background: 'bg.panel',
          zIndex: 'dropdown',
          borderRadius: '0',
          boxShadow: 'none',
          border: '2px solid',
          borderColor: 'black',
        },
      },
    },
    size: {
      xs: {
        root: {
          '--select-trigger-height': 'sizes.8',
          '--select-trigger-padding-x': 'spacing.2',
        },
        content: {
          p: '1',
          gap: '1',
          textStyle: 'xs',
        },
        trigger: {
          textStyle: 'xs',
          gap: '1',
        },
        item: {
          py: '1',
          px: '2',
        },
        itemGroupLabel: {
          py: '1',
          px: '2',
        },
        indicator: {
          _icon: {
            width: '3.5',
            height: '3.5',
          },
        },
      },
      sm: {
        root: {
          '--select-trigger-height': 'sizes.7',
          '--select-trigger-padding-x': 'spacing.2',
        },
        content: {
          p: '1',
          textStyle: 'sm',
        },
        trigger: {
          textStyle: 'sm',
          gap: '1',
        },
        indicator: {
          _icon: {
            width: '4',
            height: '4',
          },
        },
        item: {
          py: '1',
          px: '1.5',
        },
        itemGroup: {
          mt: '1',
        },
        itemGroupLabel: {
          py: '1',
          px: '1.5',
        },
      },
      md: {
        root: {
          '--select-trigger-height': 'sizes.10',
          '--select-trigger-padding-x': 'spacing.3',
        },
        content: {
          p: '1',
          textStyle: 'sm',
        },
        itemGroup: {
          mt: '1.5',
        },
        item: {
          py: '1.5',
          px: '2',
        },
        itemIndicator: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        itemGroupLabel: {
          py: '1.5',
          px: '2',
        },
        trigger: {
          textStyle: 'sm',
          gap: '2',
        },
        indicator: {
          _icon: {
            width: '4',
            height: '4',
          },
        },
      },
      lg: {
        root: {
          '--select-trigger-height': 'sizes.11',
          '--select-trigger-padding-x': 'spacing.3',
        },
        content: {
          p: '1.4',
          textStyle: 'md',
        },
        itemGroup: {
          mt: '2',
        },
        item: {
          py: '2',
          px: '3',
        },
        itemGroupLabel: {
          py: '2',
          px: '3',
        },
        trigger: {
          textStyle: 'md',
          py: '1',
          gap: '2',
        },
        indicator: {
          _icon: {
            width: '5',
            height: '5',
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
})
