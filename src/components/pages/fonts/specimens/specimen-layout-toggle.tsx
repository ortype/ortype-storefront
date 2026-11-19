'use client'

import {
  Box,
  chakra,
  defineSlotRecipe,
  useSlotRecipe,
} from '@chakra-ui/react'
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'framer-motion'
import { useId, type ReactNode } from 'react'
import type { SpecimenMode } from './specimen-sizing'

// Keep the recipe local while this design belongs only to specimens. Its slots
// isolate the pill, triggers and moving outline without changing global buttons
// or inheriting Tabs semantics/styles for what is a single-region layout switch.
const layoutToggleRecipe = defineSlotRecipe({
  slots: ['positioner', 'root', 'trigger', 'indicator', 'label'],
  base: {
    positioner: {
      display: { base: 'none', md: 'block' },
      position: 'fixed',
      bottom: 4,
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
      // border: '2px solid white',
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
      shadow: 'inset 0 0 0 2px white',
      borderRadius: 'full',
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: '1.25rem',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      _hover: {
        bg: 'white',
        color: 'black',
      },
      _focusVisible: {
        outline: '2px solid white',
        outlineOffset: '2px',
      },
    },
    indicator: {
      position: 'absolute',
      inset: 0,
      bg: 'white',
      shadow: 'inset 0 0 0 2px white',
      borderRadius: 'full',
      pointerEvents: 'none',
    },
    label: {
      position: 'relative',
      color: 'inherit',
      '&[data-active=true]': {
        color: 'black',
      },
    },
  },
})

const modes = [
  { value: 'overview', label: 'Overview' },
  { value: 'spreads', label: 'Spreads' },
  { value: 'pages', label: 'Pages' },
] as const

function TogglePresence({ children }: { children: ReactNode }) {
  const present = useIsPresent()
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: 'easeOut',
      }}
      // Exiting controls may remain visible briefly, but must stop accepting
      // pointer/keyboard input as soon as the section relinquishes the control.
      inert={!present}
      aria-hidden={!present}
      style={{ pointerEvents: present ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
  )
}

export default function SpecimenLayoutToggle({
  value,
  onValueChange,
  visible,
}: {
  value: SpecimenMode
  onValueChange: (value: SpecimenMode) => void
  visible: boolean
}) {
  const recipe = useSlotRecipe({ recipe: layoutToggleRecipe })
  const styles = recipe()
  const indicatorId = useId()
  const reducedMotion = useReducedMotion()

  return (
    <Box css={styles.positioner}>
      {/* Keep AnimatePresence mounted when visibility changes so exits run,
          matching ListTableToggle without coupling to Tester loading state. */}
      <AnimatePresence mode='wait'>
        {visible && (
          <TogglePresence key='specimen-layout-toggle'>
            <Box css={styles.root} role='group' aria-label='Specimen layout'>
              {modes.map((mode) => (
                <chakra.button
                  key={mode.value}
                  type='button'
                  css={styles.trigger}
                  aria-pressed={value === mode.value}
                  onClick={() => {
                    if (value !== mode.value) onValueChange(mode.value)
                  }}
                >
                  {value === mode.value && (
                    <Box asChild css={styles.indicator}>
                      <motion.span
                        aria-hidden='true'
                        layoutId={reducedMotion ? undefined : indicatorId}
                        transition={{
                          duration: reducedMotion ? 0 : 0.2,
                          ease: 'easeOut',
                        }}
                      />
                    </Box>
                  )}
                  <Box
                    as='span'
                    className={'label'}
                    css={styles.label}
                    data-active={value === mode.value}
                  >
                    {mode.label}
                  </Box>
                </chakra.button>
              ))}
            </Box>
          </TogglePresence>
        )}
      </AnimatePresence>
    </Box>
  )
}
