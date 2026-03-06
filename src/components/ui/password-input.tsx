'use client'

import { useValidationFeedback } from '@/commercelayer/components/forms/useValidationFeedback'
import type {
  ButtonProps,
  GroupProps,
  InputProps,
  StackProps,
} from '@chakra-ui/react'
import {
  Box,
  Field,
  Input as ChakraInput,
  HStack,
  IconButton,
  InputGroup,
  Stack,
  defineStyle,
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
  error?: string
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput(props, ref) {
  const {
    rootProps,
    label,
    name = '',
    error: errorProp,
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

  // Try to connect to react-hook-form context when name is provided
  let formContext: ReturnType<typeof useFormContext> | null = null
  try {
    formContext = useFormContext()
  } catch {
    // No FormProvider in tree
  }

  const isRegistered = !!(name && formContext)
  const registration = isRegistered ? formContext!.register(name) : null
  const { errorMessage } = isRegistered
    ? useValidationFeedback(name)
    : { errorMessage: undefined }
  const error = errorProp ?? errorMessage

  // Watch form value to drive floating label
  const formValue = isRegistered ? formContext!.watch(name) : undefined
  const currentValue = isRegistered ? (formValue ?? '') : ''
  const hasValue = String(currentValue).length > 0
  const [hasInteracted, setHasInteracted] = React.useState(false)

  return (
    <Field.Root invalid={!!error}>
      <Box pos="relative" w="full">
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
            {...(registration ?? {})}
            {...rest}
            ref={(node) => {
              registration?.ref(node)
              if (typeof ref === 'function') ref(node)
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
            }}
            placeholder={label}
            variant={'subtle'}
            size={'lg'}
            fontSize={'lg'}
            borderRadius={0}
            type={visible ? 'text' : 'password'}
            onFocus={(e) => {
              setHasInteracted(true)
              rest.onFocus?.(e)
            }}
            onBlur={(e) => {
              setHasInteracted(true)
              registration?.onBlur(e)
              rest.onBlur?.(e)
            }}
            onChange={(e) => {
              registration?.onChange(e)
              rest.onChange?.(e)
            }}
            css={hasValue ? inputStyles : undefined}
          />
        </InputGroup>
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
