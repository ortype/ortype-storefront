'use client'

import type { InputProps } from '@chakra-ui/react'
import {
  Box,
  Field,
  Input,
  defineStyle,
  useControllableState,
} from '@chakra-ui/react'
import { forwardRef, useState } from 'react'

interface FloatingLabelInputProps extends InputProps {
  label: React.ReactNode
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
  error?: string
}

export const FloatingLabelInput = forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>((props, ref) => {
  const {
    label,
    onValueChange,
    value,
    defaultValue = '',
    error,
    ...rest
  } = props

  const [inputState, setInputState] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  })

  const hasValue = inputState.length > 0

  return (
    <Field.Root invalid={!!error}>
      <Box pos="relative" w="full">
        <Input
          ref={ref}
          {...rest}
          placeholder={typeof label === 'string' ? label : String(label)}
          onFocus={(e) => {
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            props.onChange?.(e)
            setInputState(e.target.value)
          }}
          value={inputState}
          css={hasValue ? inputStyles : undefined}
        />
        {hasValue && (
          <Field.Label css={floatingStyles} animationStyle="slide-up-fade-in">
            {label}
          </Field.Label>
        )}
      </Box>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
})

FloatingLabelInput.displayName = 'FloatingLabelInput'

const inputStyles = defineStyle({
  paddingTop: '3',
  paddingBottom: '1',
})

const floatingStyles = defineStyle({
  pos: 'absolute',
  bg: 'transparent',
  px: '0.05rem',
  top: '0',
  insetStart: '3',
  fontWeight: 'normal',
  pointerEvents: 'none',
  color: 'fg',
  fontSize: '2xs',
})
