'use client'

import { useValidationFeedback } from '@/commercelayer/components/forms/useValidationFeedback'
import type { InputProps } from '@chakra-ui/react'
import {
  Box,
  Field,
  Input,
  defineStyle,
  useControllableState,
} from '@chakra-ui/react'
import { forwardRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

interface FloatingLabelInputProps extends InputProps {
  label: React.ReactNode
  /** When provided inside a FormProvider, auto-registers with react-hook-form */
  name?: string
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
    name,
    onValueChange,
    value,
    defaultValue = '',
    error: errorProp,
    ...rest
  } = props

  // Try to connect to react-hook-form context when name is provided
  let formContext: ReturnType<typeof useFormContext> | null = null
  try {
    formContext = useFormContext()
  } catch {
    // No FormProvider in tree — controlled mode only
  }

  const isRegistered = !!(name && formContext)
  const registration = isRegistered ? formContext!.register(name) : null
  const { errorMessage } = isRegistered
    ? useValidationFeedback(name)
    : { errorMessage: undefined }
  const error = errorProp ?? errorMessage

  // Controlled mode: used when no name/form registration (e.g. with Controller)
  const [inputState, setInputState] = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  })

  // When registered, watch the form value to drive the floating label
  const formValue = isRegistered ? formContext!.watch(name) : undefined
  const currentValue = isRegistered ? (formValue ?? '') : inputState
  const hasValue = String(currentValue).length > 0
  const [hasInteracted, setHasInteracted] = useState(false)

  // Build input props depending on mode
  const inputProps = isRegistered
    ? {
        ...registration,
        ...rest,
        ref: (node: HTMLInputElement | null) => {
          // Merge refs: react-hook-form's ref + forwarded ref
          registration!.ref(node)
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
        },
        placeholder: typeof label === 'string' ? label : String(label),
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          setHasInteracted(true)
          props.onFocus?.(e)
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
          setHasInteracted(true)
          registration!.onBlur(e)
          props.onBlur?.(e)
        },
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          registration!.onChange(e)
          props.onChange?.(e)
        },
      }
    : {
        ...rest,
        ref,
        placeholder: typeof label === 'string' ? label : String(label),
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          setHasInteracted(true)
          props.onFocus?.(e)
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
          setHasInteracted(true)
          props.onBlur?.(e)
        },
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          props.onChange?.(e)
          setInputState(e.target.value)
        },
        value: inputState,
      }

  return (
    <Field.Root invalid={!!error}>
      <Box pos="relative" w="full">
        <Input
          {...inputProps}
          css={hasValue ? inputStyles : undefined}
        />
        {hasValue && (
          <Field.Label
            css={floatingStyles}
            animationStyle={hasInteracted ? 'slide-up-fade-in' : undefined}
          >
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
