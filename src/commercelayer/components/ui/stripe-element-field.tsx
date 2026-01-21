'use client'

import { Box, Field, defineStyle } from '@chakra-ui/react'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from '@stripe/react-stripe-js'
import type { StripeElementChangeEvent } from '@stripe/stripe-js'
import { useState } from 'react'

interface StripeElementFieldProps {
  label: string
  element: 'cardNumber' | 'cardExpiry' | 'cardCvc'
  error?: string
  onChange?: (event: StripeElementChangeEvent) => void
  onReady?: () => void
}

// Stripe element styling to match Chakra UI theme
export const stripeElementStyle = {
  style: {
    base: {
      width: '100%',
      fontSize: '1rem',
      color: 'var(--chakra-colors-fg-default)',
      fontFamily: 'inherit',
      lineHeight: '1.5',
      '::placeholder': {
        color: 'transparent', // Hide Stripe's placeholder to avoid overlap
      },
    },
    invalid: {
      color: 'var(--chakra-colors-fg-error)',
      iconColor: 'var(--chakra-colors-fg-error)',
    },
    complete: {
      color: 'var(--chakra-colors-fg-default)',
    },
  },
} as const

/**
 * StripeElementField - Wraps Stripe Elements with FloatingLabelInput-style UI
 *
 * Provides consistent styling between regular form inputs and Stripe's iframe-based
 * payment Elements. Matches the design of FloatingLabelInput/AddressField components.
 */
export const StripeElementField: React.FC<StripeElementFieldProps> = ({
  label,
  element,
  error,
  onChange,
  onReady,
}) => {
  const [hasValue, setHasValue] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const ElementComponent = {
    cardNumber: CardNumberElement,
    cardExpiry: CardExpiryElement,
    cardCvc: CardCvcElement,
  }[element]

  const handleChange = (event: StripeElementChangeEvent) => {
    setHasValue(event.complete || !event.empty)
    onChange?.(event)
  }

  const handleFocus = () => {
    setIsFocused(true)
    setHasInteracted(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setHasInteracted(true)
  }

  return (
    <Field.Root invalid={!!error}>
      <Box pos="relative" w="full">
        {/* Container that mimics Chakra Input with variant="subtle", size="lg" */}
        <Box
          borderWidth="0"
          borderStyle="solid"
          borderColor="border.default"
          bg="brand.50"
          px={4}
          borderRadius={0}
          transition="border-color 0.2s"
          _focusWithin={{
            borderColor: 'border.emphasized',
          }}
          _invalid={{
            borderColor: 'border.error',
          }}
          css={
            hasValue || isFocused
              ? containerWithValueStyles
              : defaultContainerStyles
          }
        >
          <Box
            w="full"
            css={{
              '& .StripeElement': {
                width: '100%',
              },
            }}
          >
            <ElementComponent
              options={stripeElementStyle}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onReady={onReady}
            />
          </Box>
        </Box>

        {/* Floating label that appears when field has value or is focused */}
        {(hasValue || isFocused) && (
          <Field.Label
            css={floatingStyles}
            animationStyle={hasInteracted ? 'slide-up-fade-in' : undefined}
          >
            {label}
          </Field.Label>
        )}

        {/* Placeholder label when field is empty and not focused */}
        {!hasValue && !isFocused && (
          <Field.Label css={placeholderStyles} htmlFor={undefined}>
            {label}
          </Field.Label>
        )}
      </Box>

      {/* Error message display */}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  )
}

// Styles to match FloatingLabelInput
const defaultContainerStyles = defineStyle({
  paddingTop: '3',
  paddingBottom: '3',
})

const containerWithValueStyles = defineStyle({
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

const placeholderStyles = defineStyle({
  pos: 'absolute',
  bg: 'transparent',
  top: '50%',
  transform: 'translateY(-50%)',
  insetStart: '4',
  fontWeight: 'normal',
  pointerEvents: 'none',
  color: 'fg.muted',
  fontSize: 'md',
})
