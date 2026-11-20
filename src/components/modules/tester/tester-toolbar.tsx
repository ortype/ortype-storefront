'use client'

import {
  ToolbarPresence,
  useFloatingToolbarStyles,
} from '@/components/ui/floating-toolbar'
import {
  getAvailableTesterPresets,
  getMinimumTesterZoom,
} from '@/lib/tester-presets'
import { Box, Flex, Portal, chakra } from '@chakra-ui/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useState } from 'react'

export default function TesterToolbar({
  visible,
  zoom,
  enableLongText,
  onZoomChange,
  onReset,
  label,
}: {
  visible: boolean
  zoom: number
  enableLongText: boolean
  onZoomChange: (zoom: number) => void
  onReset: () => void
  label: string
}) {
  const styles = useFloatingToolbarStyles()
  const id = useId()
  const reducedMotion = useReducedMotion()
  const [keyboardInset, setKeyboardInset] = useState(0)
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () =>
      setKeyboardInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      )
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    update()
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])
  const minimum = getMinimumTesterZoom(enableLongText)
  const presets = getAvailableTesterPresets(enableLongText)

  return (
    <Portal>
      <Box
        css={styles.positioner}
        maxW='calc(100vw - 24px)'
        bottom={{ base: 'max(16px, env(safe-area-inset-bottom))', md: 8 }}
        style={
          keyboardInset > 0
            ? {
                bottom: `calc(${keyboardInset}px + max(16px, env(safe-area-inset-bottom)))`,
              }
            : undefined
        }
      >
        <AnimatePresence mode='wait'>
          {visible && (
            <ToolbarPresence key='tester-toolbar'>
              <Flex
                css={styles.root}
                maxW='calc(100vw - 24px)'
                flexWrap='wrap'
                justify='center'
                role='group'
                aria-label={`${label} controls`}
                data-font-tester-toolbar=''
              >
                <Flex
                  role='group'
                  aria-label='Text layout'
                  gap={1}
                  flexWrap='wrap'
                  justify='center'
                  maxW='100%'
                >
                  {presets.map((preset) => {
                    const active = Math.abs(zoom - preset.zoom) < 0.008
                    return (
                      <chakra.button
                        key={preset.value}
                        type='button'
                        css={styles.trigger}
                        aria-pressed={active}
                        onClick={() => onZoomChange(preset.zoom)}
                      >
                        {active && (
                          <Box css={styles.indicator} asChild>
                            <motion.span
                              aria-hidden='true'
                              layoutId={reducedMotion ? undefined : id}
                              transition={{
                                duration: reducedMotion ? 0 : 0.2,
                                ease: 'easeOut',
                              }}
                            />
                          </Box>
                        )}
                        <Box as='span' css={styles.label}>
                          {preset.label}
                        </Box>
                      </chakra.button>
                    )
                  })}
                </Flex>
                <Flex align='center' gap={1} pl={6} pr={2}>
                  <chakra.label
                    htmlFor={`${id}-zoom`}
                    fontSize='sm'
                    display={{ base: 'none', md: 'block' }}
                  >
                    Zoom
                  </chakra.label>
                  <chakra.output
                    htmlFor={`${id}-zoom`}
                    fontSize='2xs'
                    minW='5ch'
                    textAlign='right'
                    fontVariantNumeric='tabular-nums'
                  >
                    {Math.round(zoom * 100)}%
                  </chakra.output>
                  <chakra.input
                    id={`${id}-zoom`}
                    type='range'
                    min={minimum * 100}
                    max={100}
                    step={0.1}
                    value={zoom * 100}
                    aria-label='Text zoom'
                    aria-valuetext={`${Math.round(zoom * 100)}%`}
                    onChange={(event) =>
                      onZoomChange(Number(event.target.value) / 100)
                    }
                    width={{ base: '80px', md: '100px' }}
                    minW={0}
                    css={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      height: '24px',
                      cursor: 'pointer',

                      '&::-webkit-slider-runnable-track': {
                        height: '1px',
                        background: 'white',
                      },
                      '&::-webkit-slider-thumb': {
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        boxSizing: 'border-box',
                        width: '16px',
                        height: '16px',
                        marginTop: '-7.5px',
                        border: '1px solid white',
                        borderRadius: '50%',
                        background: 'black',
                      },

                      '&::-moz-range-track': {
                        height: '1px',
                        background: 'white',
                      },
                      '&::-moz-range-thumb': {
                        boxSizing: 'border-box',
                        width: '16px',
                        height: '16px',
                        border: '1px solid white',
                        borderRadius: '50%',
                        background: 'black',
                      },

                      _focusVisible: {
                        outline: '2px solid white',
                        outlineOffset: '3px',
                      },
                    }}
                  />
                </Flex>
                <Flex gap={1}>
                  <chakra.button
                    type='button'
                    css={styles.trigger}
                    aria-label='Decrease text size'
                    disabled={zoom <= minimum}
                    onClick={() => onZoomChange(zoom - 0.08)}
                  >
                    −
                  </chakra.button>
                  <chakra.button
                    type='button'
                    css={styles.trigger}
                    aria-label='Increase text size'
                    disabled={zoom >= 1}
                    onClick={() => onZoomChange(zoom + 0.08)}
                  >
                    +
                  </chakra.button>
                  <chakra.button
                    type='button'
                    css={styles.trigger}
                    onClick={onReset}
                  >
                    Reset
                  </chakra.button>
                </Flex>
              </Flex>
            </ToolbarPresence>
          )}
        </AnimatePresence>
      </Box>
    </Portal>
  )
}
