'use client'

import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { StripeElementField } from '@/commercelayer/components/ui/stripe-element-field'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Alert } from '@/components/ui/alert'
import { Box, Spinner, Stack, Text } from '@chakra-ui/react'
import {
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import type {
  Stripe,
  StripeConstructorOptions,
  StripeElementLocale,
  StripeElementsOptions,
} from '@stripe/stripe-js'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { CustomStripePaymentProps } from './types'

interface CustomStripePaymentFormProps {
  stripe: Stripe | null
  clientSecret: string
  templateCustomerSaveToWallet?: (props: { name: string }) => JSX.Element
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
}

/**
 * PCI-Compliant Custom Stripe payment form using Elements
 */
const CustomStripeElementsForm: React.FC<{
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
  templateCustomerSaveToWallet?: (props: { name: string }) => JSX.Element
}> = ({ onPaymentReady, setPaymentRef, templateCustomerSaveToWallet }) => {
  const formRef = useRef<HTMLFormElement>(null)
  const stripe = useStripe()
  const elements = useElements()
  const checkoutCtx = useContext(CheckoutContext)

  const [isComplete, setIsComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  })
  const [elementsReady, setElementsReady] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  })
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!checkoutCtx) {
    throw new Error(
      'CustomStripeElementsForm must be used within CheckoutProvider'
    )
  }

  const { order, registerPaymentSubmitter } = checkoutCtx

  // Check if all elements are complete
  const allComplete =
    isComplete.cardNumber &&
    isComplete.cardExpiry &&
    isComplete.cardCvc &&
    cardholderName.trim()

  // Check if all Stripe Elements are ready (iframes mounted)
  const allElementsReady =
    elementsReady.cardNumber &&
    elementsReady.cardExpiry &&
    elementsReady.cardCvc

  /**
   * Payment Handler Registration Logic
   *
   * This useEffect implements a "Handler Registration Pattern" that allows the parent
   * CheckoutProvider to programmatically trigger payment submission from this form.
   *
   * WHY THIS PATTERN EXISTS:
   * 1. **Separation of Concerns**: The "Place Order" button lives outside this component
   *    (in the checkout flow), but needs to trigger payment submission from THIS form
   * 2. **Decoupled Architecture**: The checkout flow doesn't need to know HOW payment
   *    works, just that it can call a registered handler
   * 3. **Multiple Payment Methods**: Different payment forms (Stripe, PayPal, etc.) can
   *    all register their own handlers using the same pattern
   *
   * HOW IT WORKS:
   * 1. This component creates a `submitPayment` function with all the Stripe logic
   * 2. It registers this function with the CheckoutProvider via `registerPaymentSubmitter`
   * 3. When user clicks "Place Order", CheckoutProvider calls the registered handler
   * 4. The handler executes and returns success/failure status
   *
   * LIFECYCLE:
   * - Setup: Register the handler when Stripe is ready and form is complete
   * - Cleanup: Unregister on unmount to prevent memory leaks and stale handlers
   * - Dependencies: Re-register when key dependencies change (form completeness, etc.)
   */
  useEffect(() => {
    // Wait for Stripe to be ready before registering handler
    if (!stripe || !elements) return

    /**
     * The actual payment submission function that gets registered
     * This function will be called by the CheckoutProvider when "Place Order" is clicked
     */
    const submitPayment = async (): Promise<boolean> => {
      if (!allComplete) {
        setError('Please fill in all payment details')
        return false
      }

      try {
        const cardElement = elements.getElement(CardNumberElement)
        if (!cardElement) {
          setError('Card element not found')
          return false
        }

        // Read checkbox value directly from DOM at payment time
        let shouldSaveToWallet = false
        if (formRef.current) {
          const checkbox = formRef.current.elements.namedItem(
            'save_payment_source_to_customer_wallet'
          ) as HTMLInputElement
          shouldSaveToWallet = checkbox?.checked ?? false
        }

        // Prepare billing details from order
        const billingDetails = {
          name: cardholderName,
          email: order?.customer_email || '',
          phone: order?.billing_address?.phone || '',
          address: {
            city: order?.billing_address?.city || '',
            country: order?.billing_address?.country_code || '',
            line1: order?.billing_address?.line_1 || '',
            line2: order?.billing_address?.line_2 || '',
            postal_code: order?.billing_address?.zip_code || '',
            state: order?.billing_address?.state_code || '',
          },
        }

        // Prepare return URL
        const url = new URL(window.location.href)
        const returnUrl = `${url.origin}${
          url.pathname
        }?accessToken=${url.searchParams.get('accessToken')}`

        // Confirm payment using Elements
        const { error } = await stripe.confirmCardPayment(
          order?.payment_source?.client_secret || '',
          {
            payment_method: {
              card: cardElement,
              billing_details: billingDetails,
            },
            return_url: returnUrl,
            setup_future_usage: shouldSaveToWallet ? 'off_session' : undefined,
          }
        )

        console.log('Payment attempt with save to wallet:', shouldSaveToWallet)

        if (error) {
          console.error('Payment error:', error)
          setError(error.message || 'Payment failed')
          return false
        }

        console.log('Payment confirmed successfully')
        return true
      } catch (error) {
        console.error('Payment submission error:', error)
        setError(error instanceof Error ? error.message : 'Payment failed')
        return false
      }
    }

    // 📝 REGISTER: Tell CheckoutProvider "this is how to submit payment from this form"
    registerPaymentSubmitter(submitPayment)

    // 🔗 FORM REF: Give parent access to the form element for validation/focus
    if (setPaymentRef) {
      setPaymentRef(formRef)
    }

    // 🧹 CLEANUP: Unregister when component unmounts or dependencies change
    return () => {
      // Replace with no-op function to prevent calling stale handler
      registerPaymentSubmitter(async () => true)

      // Clear form reference
      if (setPaymentRef) {
        setPaymentRef({ current: null })
      }
    }
  }, [
    // Re-register when any of these change:
    stripe, // Stripe instance becomes available
    elements, // Elements context becomes available
    allComplete, // Form completion status changes
    cardholderName, // User enters/changes name
    order, // Order data changes (billing info, etc.)
    registerPaymentSubmitter, // CheckoutProvider function (stable)
    setPaymentRef, // Parent callback (stable)
  ])

  // Notify parent when payment is ready
  useEffect(() => {
    if (onPaymentReady) {
      onPaymentReady(Boolean(allComplete && !!stripe && !!elements))
    }
  }, [allComplete, stripe, elements, onPaymentReady])

  return (
    <Box position="relative">
      {/* Show spinner overlay while Elements are loading */}
      {!allElementsReady && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={1}
          py={8}
        >
          <Spinner size="lg" />
        </Box>
      )}

      {error && (
        <Alert status="error" mb={4} size="sm">
          {error}
        </Alert>
      )}

      <form
        ref={formRef}
        style={{
          opacity: allElementsReady ? 1 : 0.3,
          transition: 'opacity 0.2s',
        }}
      >
        <Stack gap={1}>
          {/* Card Number */}
          <StripeElementField
            label="Card Number"
            element="cardNumber"
            error={errors.cardNumber}
            onReady={() => {
              console.log('CardNumber onReady fired')
              setElementsReady((prev) => ({ ...prev, cardNumber: true }))
            }}
            onChange={(e) => {
              setIsComplete((prev) => ({
                ...prev,
                cardNumber: e.complete,
              }))
              setErrors((prev) => ({
                ...prev,
                cardNumber: e.error?.message || '',
              }))
              setError(null)
            }}
          />

          {/* Expiry and CVC */}
          <Stack direction="row" gap={1}>
            <Box flex={1}>
              <StripeElementField
                label="Expiry Date"
                element="cardExpiry"
                error={errors.cardExpiry}
                onReady={() => {
                  console.log('CardExpiry onReady fired')
                  setElementsReady((prev) => ({ ...prev, cardExpiry: true }))
                }}
                onChange={(e) => {
                  setIsComplete((prev) => ({
                    ...prev,
                    cardExpiry: e.complete,
                  }))
                  setErrors((prev) => ({
                    ...prev,
                    cardExpiry: e.error?.message || '',
                  }))
                  setError(null)
                }}
              />
            </Box>

            <Box flex={1}>
              <StripeElementField
                label="CVC"
                element="cardCvc"
                error={errors.cardCvc}
                onReady={() => {
                  console.log('CardCvc onReady fired')
                  setElementsReady((prev) => ({ ...prev, cardCvc: true }))
                }}
                onChange={(e) => {
                  setIsComplete((prev) => ({
                    ...prev,
                    cardCvc: e.complete,
                  }))
                  setErrors((prev) => ({
                    ...prev,
                    cardCvc: e.error?.message || '',
                  }))
                  setError(null)
                }}
              />
            </Box>
          </Stack>

          {/* Cardholder Name */}
          <FloatingLabelInput
            label="Cardholder Name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            variant="subtle"
            size="lg"
            fontSize="md"
            borderRadius={0}
          />

          {/* 
          Save to Wallet Checkbox 
          // @TODO: style this
          {templateCustomerSaveToWallet ? (
            <Box>
              {templateCustomerSaveToWallet({
                name: 'save_payment_source_to_customer_wallet',
              })}
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={2}>
              <input
                type="checkbox"
                id="save_payment_source_to_customer_wallet"
                name="save_payment_source_to_customer_wallet"
                defaultChecked={false}
              />
              <label htmlFor="save_payment_source_to_customer_wallet">
                Save card for future purchases
              </label>
            </Box>
          )}
          */}
        </Stack>
      </form>
    </Box>
  )
}

/**
 * Wrapper that provides Stripe Elements context
 */
const CustomStripePaymentForm: React.FC<CustomStripePaymentFormProps> = ({
  stripe,
  clientSecret,
  templateCustomerSaveToWallet,
  onPaymentReady,
  setPaymentRef,
}) => {
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
  }

  return (
    <Elements stripe={stripe} options={elementsOptions}>
      <CustomStripeElementsForm
        onPaymentReady={onPaymentReady}
        setPaymentRef={setPaymentRef}
        templateCustomerSaveToWallet={templateCustomerSaveToWallet}
      />
    </Elements>
  )
}

/**
 * Main custom Stripe payment component with feature flag support
 */
export const CustomStripePayment: React.FC<CustomStripePaymentProps> = ({
  publishableKey,
  show = true,
  clientSecret,
  locale = 'auto',
  connectedAccount,
  containerClassName,
  templateCustomerSaveToWallet,
  onPaymentReady,
  setPaymentRef,
  ...divProps
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Basic validation for required environment variables
  useEffect(() => {
    if (!publishableKey) {
      setError(
        'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable'
      )
    }
  }, [publishableKey])

  // Load Stripe when component shows
  useEffect(() => {
    if (!show || !publishableKey || error) return

    import('@stripe/stripe-js')
      .then(({ loadStripe }) => {
        const getStripe = async (): Promise<void> => {
          try {
            const options = {
              locale,
              ...(connectedAccount ? { stripeAccount: connectedAccount } : {}),
            } satisfies StripeConstructorOptions

            const res = await loadStripe(publishableKey, options)
            if (res != null) {
              setStripe(res)
            } else {
              setError('Failed to initialize Stripe')
            }
          } catch (err) {
            console.error('Error loading Stripe:', err)
            setError('Failed to load Stripe')
          }
        }
        getStripe()
      })
      .catch((err) => {
        console.error('Error importing Stripe:', err)
        setError('Failed to import Stripe')
      })

    return () => {
      setStripe(null)
    }
  }, [show, publishableKey, connectedAccount, locale, error])

  if (!show) {
    return null
  }

  if (error) {
    return (
      <Alert status="error" size="sm">
        {error}
      </Alert>
    )
  }

  // Show spinner until Stripe and clientSecret are ready
  // This prevents "Invalid clientSecret" error when Elements tries to render
  if (!stripe || !clientSecret) {
    return (
      <Box
        className={containerClassName}
        {...divProps}
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={8}
      >
        <Spinner size="lg" />
      </Box>
    )
  }

  return (
    <Box className={containerClassName} {...divProps}>
      <CustomStripePaymentForm
        stripe={stripe}
        clientSecret={clientSecret}
        templateCustomerSaveToWallet={templateCustomerSaveToWallet}
        onPaymentReady={onPaymentReady}
        setPaymentRef={setPaymentRef}
      />
    </Box>
  )
}

export default CustomStripePayment
