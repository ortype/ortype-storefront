'use client'

import { Box, chakra } from '@chakra-ui/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useId } from 'react'
import {
  ToolbarPresence,
  useFloatingToolbarStyles,
} from '@/components/ui/floating-toolbar'
import type { SpecimenMode } from './specimen-sizing'

const modes = [
  { value: 'overview', label: 'Overview' },
  { value: 'spreads', label: 'Spreads' },
  { value: 'pages', label: 'Pages' },
] as const

export default function SpecimenLayoutToggle({
  value,
  onValueChange,
  visible,
}: {
  value: SpecimenMode
  onValueChange: (value: SpecimenMode) => void
  visible: boolean
}) {
  const styles = useFloatingToolbarStyles()
  const indicatorId = useId()
  const reducedMotion = useReducedMotion()

  return (
    <Box css={styles.positioner} display={{ base: 'none', md: 'block' }}>
      {/* Keep AnimatePresence mounted when visibility changes so exits run,
          matching ListTableToggle without coupling to Tester loading state. */}
      <AnimatePresence mode='wait'>
        {visible && (
          <ToolbarPresence key='specimen-layout-toggle'>
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
          </ToolbarPresence>
        )}
      </AnimatePresence>
    </Box>
  )
}
