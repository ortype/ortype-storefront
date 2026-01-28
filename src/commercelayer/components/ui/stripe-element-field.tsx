'use client'

import { Box, Field, defineStyle } from '@chakra-ui/react'
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from '@stripe/react-stripe-js'
import type { StripeElement, StripeElementChangeEvent } from '@stripe/stripe-js'
import { useEffect, useMemo, useState } from 'react'

interface StripeElementFieldProps {
  label: string
  element: 'cardNumber' | 'cardExpiry' | 'cardCvc'
  error?: string
  onChange?: (event: StripeElementChangeEvent) => void
  onReady?: () => void
}

export const StripeElementSkelton: React.FC<{ label: string }> = ({
  label,
}) => {
  return (
    <Field.Root>
      <Box pos="relative" w="full">
        {/* Container that mimics Chakra Input with variant="subtle", size="lg" */}
        <Box
          borderWidth="0"
          borderStyle="solid"
          borderColor="transparent"
          bg="brand.50"
          px={3}
          borderRadius={0}
          h={'var(--or-sizes-11)'}
          css={defaultContainerStyles}
        >
          <Box
            w="full"
            css={{
              '& .StripeElement': {
                width: '100%',
              },
            }}
          />
        </Box>

        <Field.Label css={placeholderStyles} htmlFor={undefined}>
          {label}
        </Field.Label>
      </Box>
    </Field.Root>
  )
}

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
  const [elementInstance, setElementInstance] = useState<StripeElement | null>(
    null
  )

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

  // Sync Stripe Element font size with responsive typography
  // 1. Read the computed HTML font-size at mount and on window resize
  // 2. Calculate proportional sizes based on your responsive typography (1.25rem for font size, 1.5rem for line height)
  // 3. Update the Element dynamically using Stripe's .update() method
  useEffect(() => {
    if (!elementInstance) return

    const updateFontSize = () => {
      const htmlFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      )
      // Stripe Elements should match body text size (1.25rem equivalent in your design)
      const calculatedFontSize = `${htmlFontSize * 1}px`
      const calculatedLineHeight = `${htmlFontSize * 1.5}px` // matches BASELINE * 0.75

      elementInstance.update({
        style: {
          base: {
            fontSize: calculatedFontSize,
            lineHeight: calculatedLineHeight,
          },
        },
      })
    }

    // Update on mount and resize
    updateFontSize()
    window.addEventListener('resize', updateFontSize)

    return () => window.removeEventListener('resize', updateFontSize)
  }, [elementInstance])

  // CSS Variables Not Available in iframes
  // Dynamically compute actual color
  const stripeElementStyle = useMemo(() => {
    const errorColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--or-colors-fg-error')
        .trim() || '#ef4444'

    const completeColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--or-colors-fg')
        .trim() || '#000'

    return {
      style: {
        base: {
          width: '100%',
          fontSize: '20px', // these get reset by element updater
          lineHeight: '1.5rem',
          color: 'black',
          fontFamily: 'Alltaf-Regular, sans',
          fontWeight: '400',
          // '-webkit-font-smoothing': 'antialiased', // @TODO: how to implement this prop in the iframe?
          '::placeholder': {
            color: 'transparent', // Hide Stripe's placeholder to avoid overlap
          },
        },
        invalid: { color: errorColor, iconColor: errorColor },
        complete: { color: completeColor },
      },
    }
  }, [])

  return (
    <Field.Root invalid={!!error}>
      <Box
        pos="relative"
        w="full"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 0,
          pointerEvents: 'none',
          ...(isFocused && {
            boxShadow: '0 0 0 3px black',
          }),
        }}
      >
        {/* Container that mimics Chakra Input with variant="subtle", size="lg" */}
        <Box
          borderWidth="0"
          borderStyle="solid"
          borderColor="transparent"
          bg="brand.50"
          px={3}
          borderRadius={0}
          h={'var(--or-sizes-11)'}
          css={hasValue ? containerWithValueStyles : defaultContainerStyles}
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
              onReady={(el) => {
                setElementInstance(el)
                onReady?.()
              }}
            />
          </Box>
        </Box>

        {/* Floating label that appears when field has value or is focused */}
        {hasValue && (
          <Field.Label
            css={floatingStyles}
            animationStyle={hasInteracted ? 'slide-up-fade-in' : undefined}
          >
            {label}
          </Field.Label>
        )}

        {/* Placeholder label when field is empty and not focused */}
        {!hasValue && (
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
  paddingTop: '4',
  paddingBottom: '1',
})

const floatingStyles = defineStyle({
  pos: 'absolute',
  bg: 'transparent',
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
  insetStart: '3',
  fontWeight: 'normal',
  pointerEvents: 'none',
  color: 'fg.muted',
  fontSize: 'md',
})
