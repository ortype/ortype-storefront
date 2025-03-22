import { defineSlotRecipe } from '@chakra-ui/react'

export const segmentGroupSlotRecipe = defineSlotRecipe({
  className: 'or-segment-group',
  slots: ['root', 'label', 'item', 'itemText', 'itemControl', 'indicator'],
  base: {
    root: {
      // '--segment-radius': 'radii.l2',
      borderRadius: 'none',
      display: 'inline-flex',
      boxShadow: 'none',
      minW: 'max-content',
      textAlign: 'center',
      position: 'relative',
      isolation: 'isolate',
      bg: 'white',
      border: '2px solid black',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      fontSize: 'sm',
      position: 'relative',
      color: 'black',
      borderRadius: 'none',
      _disabled: {
        opacity: '0.5',
      },
      '&:has(input:focus-visible)': {
        focusRing: 'outside',
      },
      _before: {
        content: '""',
        position: 'absolute',
        insetInlineStart: 0,
        insetBlock: '1.5',
        bg: 'black',
        width: '2px',
        transition: 'opacity 0.2s',
      },
      '& + &[data-state=checked], &[data-state=checked] + &, &:first-of-type': {
        _before: {
          opacity: '0',
        },
      },
      '&[data-state=checked]': {
        color: 'white',
      },
      '&[data-state=checked][data-ssr]': {
        // shadow: 'sm',
        bg: 'black',
        borderRadius: 'none',
      },
    },
    indicator: {
      // shadow: 'sm',
      pos: 'absolute',
      bg: 'black',
      width: 'var(--width)',
      height: 'var(--height)',
      top: 'var(--top)',
      left: 'var(--left)',
      zIndex: -1,
      borderRadius: 'none',
    },
  },
  variants: {
    size: {
      xs: {
        root: {
          height: '6',
        },
        item: {
          textStyle: 'xs',
          px: '3',
          gap: '1',
        },
      },
      sm: {
        root: {
          height: '7',
        },
        item: {
          textStyle: 'md',
          px: '3',
          gap: '2',
        },
      },
      md: {
        root: {
          height: '8',
        },
        item: {
          textStyle: 'lg',
          px: '3',
          gap: '2',
        },
      },
      lg: {
        root: {
          height: '10',
        },
        item: {
          textStyle: 'md',
          px: '5',
          gap: '3',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
