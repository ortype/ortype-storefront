'use client'

import {
  NativeSelectField,
  NativeSelectRoot,
  type NativeSelectFieldProps,
} from '@/components/ui/native-select'
import { Box, defineStyle, Field, useControllableState } from '@chakra-ui/react'
import { forwardRef, useState } from 'react'

interface FloatingLabelSelectProps
  extends Omit<NativeSelectFieldProps, 'onValueChange'> {
  label: React.ReactNode
  value?: string | undefined
  defaultValue?: string | undefined
  onValueChange?: ((value: string) => void) | undefined
  error?: string
  disabled?: boolean
  variant?: string
  size?: string
  fontSize?: string
  borderRadius?: number
}

export const FloatingLabelSelect = forwardRef<
  HTMLSelectElement,
  FloatingLabelSelectProps
>((props, ref) => {
  const {
    label,
    onValueChange,
    value,
    defaultValue = '',
    error,
    disabled,
    variant = 'subtle',
    size = 'lg',
    fontSize = 'md',
    borderRadius = 0,
    ...rest
  } = props

  const [selectState, setSelectState] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  })

  const hasValue = selectState.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    setSelectState(newValue)
    props.onChange?.(e)
  }

  // Create placeholder option if items exist and label is provided
  const itemsWithPlaceholder = rest.items
    ? [
        {
          value: '',
          label: typeof label === 'string' ? label : String(label),
          disabled: false,
        },
        ...rest.items,
      ]
    : rest.items

  return (
    <Field.Root invalid={!!error}>
      <Box pos="relative" w="full">
        <NativeSelectRoot
          disabled={disabled}
          variant={variant}
          size={size}
          fontSize={fontSize}
          borderRadius={borderRadius}
        >
          <NativeSelectField
            ref={ref}
            {...rest}
            items={itemsWithPlaceholder}
            value={selectState}
            onChange={handleChange}
            onFocus={(e) => {
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              props.onBlur?.(e)
            }}
            borderRadius={borderRadius}
            css={hasValue ? selectStyles : selectStylesDefault}
          />
        </NativeSelectRoot>
        <Field.Label css={floatingStyles}>
          {label}
        </Field.Label>
      </Box>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
})

FloatingLabelSelect.displayName = 'FloatingLabelSelect'

const selectStylesDefault = defineStyle({
  paddingTop: '3',
  paddingBottom: '1',
  paddingLeft: '3',
  color: 'fg.muted',
  '& option[value=""]': {
    color: 'fg.muted',
  },
  '& option:not([value=""])': {
    color: 'fg',
  },
})

const selectStyles = defineStyle({
  paddingTop: '3',
  paddingBottom: '1',
  paddingLeft: '3',
  color: 'fg',
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
  zIndex: 1,
  fontSize: '2xs',
})
