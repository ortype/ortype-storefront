'use client'

import { defineSlotRecipe, useSlotRecipe } from '@chakra-ui/react'
import { motion, useIsPresent, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Shared by specimen and tester controls; preserve the specimen design exactly.
const floatingToolbarRecipe = defineSlotRecipe({
  slots: ['positioner', 'root', 'trigger', 'indicator', 'label'],
  base: {
    positioner: {
      position: 'fixed',
      bottom: 8,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'docked',
      pointerEvents: 'none',
    },
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      width: 'max-content',
      bg: 'black',
      color: 'white',
      shadow: '0 0 0 2px white',
      borderRadius: 'full',
      py: 1.5,
      px: 2,
    },
    trigger: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '33px',
      px: 2,
      bg: 'transparent',
      color: 'white',
      borderRadius: 'full',
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: '1.25rem',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      _hover: { bg: 'white', color: 'black' },
      _focusVisible: { outline: '2px solid white', outlineOffset: '2px' },
      _disabled: { opacity: 0.4, cursor: 'not-allowed' },
    },
    indicator: {
      position: 'absolute',
      inset: 0,
      shadow: 'inset 0 0 0 2px white',
      borderRadius: 'full',
      pointerEvents: 'none',
    },
    label: { position: 'relative', color: 'inherit' },
  },
})

export function useFloatingToolbarStyles() {
  return useSlotRecipe({ recipe: floatingToolbarRecipe })()
}

export function ToolbarPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent()
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
      inert={!present}
      aria-hidden={!present}
      style={{ pointerEvents: present ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
  )
}
