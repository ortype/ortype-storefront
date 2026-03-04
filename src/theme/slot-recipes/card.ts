import { defineSlotRecipe } from '@chakra-ui/react'

import { cardAnatomy } from '@chakra-ui/react/anatomy'

export const customCardRecipe = defineSlotRecipe({
  className: 'chakra-card',
  slots: cardAnatomy.keys(),
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      minWidth: '0',
      wordWrap: 'break-word',
      // borderRadius: 'l3',
      borderRadius: '0',
      color: 'fg',
      textAlign: 'start',
    },
    title: {
      fontWeight: 'normal',
      textTransform: 'uppercase',
    },
    description: {
      color: 'fg.muted',
      fontSize: 'sm',
    },
    header: {
      paddingInline: 'var(--card-padding)',
      paddingTop: 'var(--card-padding)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      fontSize: 'xl',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    body: {
      padding: 'var(--card-padding)',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      paddingInline: 'var(--card-padding)',
      paddingBottom: 'var(--card-padding)',
    },
  },
  variants: {
    // add new variant="ghost"
    variant: {
      gradient: {
        root: {
          // bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: 'white',
        },
      },
      subtle: {
        root: {
          bg: '#eee',
        },
      },
    },
    size: {
      // ... existing sizes (sm, md, lg)
      xl: {
        root: { '--card-padding': 'spacing.6' },
        title: { fontSize: 'xl' },
      },
    },
  },
  defaultVariants: {
    variant: 'subtle', // Default to elevated instead of outline
    size: 'xl', // Default to lg instead of md
  },
})

export const cardSlotRecipe = defineSlotRecipe({
  className: 'chakra-card',
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      minWidth: '0',
      wordWrap: 'break-word',
      borderRadius: 'l3',
      color: 'fg',
      textAlign: 'start',
    },
    title: {
      fontWeight: 'semibold',
    },
    description: {
      color: 'fg.muted',
      fontSize: 'sm',
    },
    header: {
      paddingInline: 'var(--card-padding)',
      paddingTop: 'var(--card-padding)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
    },
    body: {
      padding: 'var(--card-padding)',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      paddingInline: 'var(--card-padding)',
      paddingBottom: 'var(--card-padding)',
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          '--card-padding': 'spacing.4',
        },
        title: {
          textStyle: 'md',
        },
      },
      md: {
        root: {
          '--card-padding': 'spacing.6',
        },
        title: {
          textStyle: 'lg',
        },
      },
      lg: {
        root: {
          '--card-padding': 'spacing.7',
        },
        title: {
          textStyle: 'xl',
        },
      },
    },
    variant: {
      elevated: {
        root: {
          bg: 'bg.panel',
          boxShadow: 'md',
        },
      },
      outline: {
        root: {
          bg: 'bg.panel',
          borderWidth: '1px',
          borderColor: 'border',
        },
      },
      subtle: {
        root: {
          bg: 'bg.muted',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
})
