'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Stripe, StripeConstructorOptions, StripeElementLocale } from '@stripe/stripe-js'
import { Box, Text } from '@chakra-ui/react'
import { Alert } from '@/components/ui/alert'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import type { CustomStripePaymentProps } from './types'

interface CustomStripePaymentFormProps {
  stripe: Stripe | null
  clientSecret: string
  templateCustomerSaveToWallet?: (props: { name: string }) => JSX.Element
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
}

// Stable element options
const ELEMENT_OPTIONS = {} as const

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
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!checkoutCtx) {
    throw new Error('CustomStripeElementsForm must be used within CheckoutProvider')
  }

  const { order, registerPaymentSubmitter } = checkoutCtx

  // Check if all elements are complete
  const allComplete = isComplete.cardNumber && isComplete.cardExpiry && isComplete.cardCvc && cardholderName.trim()

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
          const checkbox = formRef.current.elements.namedItem('save_payment_source_to_customer_wallet') as HTMLInputElement
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
        const returnUrl = `${url.origin}${url.pathname}?accessToken=${url.searchParams.get('accessToken')}`

        // Confirm payment using Elements
        const { error } = await stripe.confirmCardPayment(order?.payment_source?.client_secret || '', {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails,
          },
          return_url: returnUrl,
          setup_future_usage: shouldSaveToWallet ? 'off_session' : undefined,
        })
        
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
    stripe,              // Stripe instance becomes available
    elements,            // Elements context becomes available  
    allComplete,         // Form completion status changes
    cardholderName,      // User enters/changes name
    order,               // Order data changes (billing info, etc.)
    registerPaymentSubmitter, // CheckoutProvider function (stable)
    setPaymentRef        // Parent callback (stable)
  ])

  // Notify parent when payment is ready
  useEffect(() => {
    if (onPaymentReady) {
      onPaymentReady(Boolean(allComplete && !!stripe && !!elements))
    }
  }, [allComplete, stripe, elements, onPaymentReady])

  return (
    <Box>
      {error && (
        <Alert status="error" mb={4} size="sm">
          {error}
        </Alert>
      )}

      <form ref={formRef}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card Number */}
          <div>
            <label>Card Number</label>
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <CardNumberElement
                options={ELEMENT_OPTIONS}
                onChange={(e) => {
                  setIsComplete(prev => ({
                    ...prev,
                    cardNumber: e.complete,
                  }))
                  setError(null)
                }}
              />
            </div>
          </div>

          {/* Expiry and CVC */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                <CardExpiryElement
                  options={ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setIsComplete(prev => ({
                      ...prev,
                      cardExpiry: e.complete,
                    }))
                    setError(null)
                  }}
                />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label>CVC</label>
              <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                <CardCvcElement
                  options={ELEMENT_OPTIONS}
                  onChange={(e) => {
                    setIsComplete(prev => ({
                      ...prev,
                      cardCvc: e.complete,
                    }))
                    setError(null)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label>Cardholder Name</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              style={{ 
                border: '1px solid #ccc', 
                padding: '10px', 
                borderRadius: '4px',
                width: '100%',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Save to Wallet Checkbox */}
          {templateCustomerSaveToWallet ? (
            <div>
              {templateCustomerSaveToWallet({
                name: 'save_payment_source_to_customer_wallet',
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="save_payment_source_to_customer_wallet"
                name="save_payment_source_to_customer_wallet"
                defaultChecked={false}
              />
              <label htmlFor="save_payment_source_to_customer_wallet">
                Save card for future purchases
              </label>
            </div>
          )}
        </div>
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
  if (!stripe) {
    return (
      <Box>
        <Text fontSize="sm" color="gray.600">
          Loading payment form...
        </Text>
      </Box>
    )
  }

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
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Basic validation for required environment variables
  useEffect(() => {
    if (!publishableKey) {
      setError('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable')
    }
  }, [publishableKey])

  // Load Stripe when component shows
  useEffect(() => {
    if (!show || !publishableKey || error) return

    import('@stripe/stripe-js').then(({ loadStripe }) => {
      const getStripe = async (): Promise<void> => {
        try {
          const options = {
            locale,
            ...(connectedAccount ? { stripeAccount: connectedAccount } : {}),
          } satisfies StripeConstructorOptions

          const res = await loadStripe(publishableKey, options)
          if (res != null) {
            setStripe(res)
            setIsLoaded(true)
          } else {
            setError('Failed to initialize Stripe')
          }
        } catch (err) {
          console.error('Error loading Stripe:', err)
          setError('Failed to load Stripe')
        }
      }
      getStripe()
    }).catch((err) => {
      console.error('Error importing Stripe:', err)
      setError('Failed to import Stripe')
    })

    return () => {
      setIsLoaded(false)
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

  if (!isLoaded || !stripe || !clientSecret) {
    return (
      <Box className={containerClassName} {...divProps}>
        <Text fontSize="sm" color="gray.600">
          Loading payment form...
        </Text>
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
