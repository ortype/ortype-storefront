'use client'

import { useValidationFeedback } from '@/commercelayer/components/forms/useValidationFeedback'
import { Field } from '@/components/ui/field'
import type {
  ButtonProps,
  GroupProps,
  InputProps,
  StackProps,
} from '@chakra-ui/react'
import {
  Box,
  Input as ChakraInput,
  HStack,
  IconButton,
  InputGroup,
  Stack,
  mergeRefs,
  useControllableState,
} from '@chakra-ui/react'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { LuEye, LuEyeOff } from 'react-icons/lu'
export interface PasswordVisibilityProps {
  defaultVisible?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  visibilityIcon?: { on: React.ReactNode; off: React.ReactNode }
}

export interface PasswordInputProps
  extends Omit<InputProps, 'type'>,
    PasswordVisibilityProps {
  rootProps?: GroupProps
  label?: string
  name?: string
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput(props, ref) {
  const {
    rootProps,
    label,
    name = '',
    defaultVisible,
    visible: visibleProp,
    onVisibleChange,
    visibilityIcon = { on: <LuEye />, off: <LuEyeOff /> },
    ...rest
  } = props

  const [visible, setVisible] = useControllableState({
    value: visibleProp,
    defaultValue: defaultVisible || false,
    onChange: onVisibleChange,
  })

  const form = useFormContext()
  const { hasError, errorMessage } = useValidationFeedback(name)
  const registration = form?.register(name)

  return (
    <Field label={label} errorText={errorMessage} invalid={hasError}>
      <InputGroup
        w="full"
        endElement={
          <VisibilityTrigger
            disabled={rest.disabled}
            onPointerDown={(e) => {
              if (rest.disabled) return
              if (e.button !== 0) return
              e.preventDefault()
              setVisible(!visible)
            }}
          >
            {visible ? visibilityIcon.off : visibilityIcon.on}
          </VisibilityTrigger>
        }
        gap={0}
        {...rootProps}
      >
        <ChakraInput
          {...registration}
          {...rest}
          variant={'subtle'}
          type={visible ? 'text' : 'password'}
        />
      </InputGroup>
    </Field>
  )
})

const VisibilityTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function VisibilityTrigger(props, ref) {
    return (
      <IconButton
        tabIndex={-1}
        ref={ref}
        // me="-2"
        aspectRatio="square"
        size="sm"
        variant="plain"
        height="calc(100% - {spacing.2})"
        aria-label="Toggle password visibility"
        {...props}
      />
    )
  }
)

interface PasswordStrengthMeterProps extends StackProps {
  max?: number
  value: number
}

export const PasswordStrengthMeter = React.forwardRef<
  HTMLDivElement,
  PasswordStrengthMeterProps
>(function PasswordStrengthMeter(props, ref) {
  const { max = 4, value, ...rest } = props

  const percent = (value / max) * 100
  const { label, colorPalette } = getColorPalette(percent)

  return (
    <Stack align="flex-end" gap="1" ref={ref} {...rest}>
      <HStack width="full" ref={ref} {...rest}>
        {Array.from({ length: max }).map((_, index) => (
          <Box
            key={index}
            height="1"
            flex="1"
            rounded="sm"
            data-selected={index < value ? '' : undefined}
            layerStyle="fill.subtle"
            colorPalette="gray"
            _selected={{
              colorPalette,
              layerStyle: 'fill.solid',
            }}
          />
        ))}
      </HStack>
      {label && <HStack textStyle="xs">{label}</HStack>}
    </Stack>
  )
})

function getColorPalette(percent: number) {
  switch (true) {
    case percent < 33:
      return { label: 'Low', colorPalette: 'red' }
    case percent < 66:
      return { label: 'Medium', colorPalette: 'orange' }
    default:
      return { label: 'High', colorPalette: 'green' }
  }
}
