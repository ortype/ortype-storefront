import { useContext, useEffect, useRef, useState, type JSX } from 'react'
import { Elements, PaymentElement, useElements } from '@stripe/react-stripe-js'
import type {
  Stripe,
  StripeConstructorOptions,
  StripeElementLocale,
  StripeElements,
  StripeElementsOptions,
  StripePaymentElementChangeEvent,
  StripePaymentElementOptions,
} from '@stripe/stripe-js'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { usePaymentMethodContext } from '../payment/payment-method'
import { CustomerSaveToWalletProps } from '../payment/payment-source'

export interface StripeConfig {
  containerClassName?: string
  hintLabel?: string
  name?: string
  options?: StripePaymentElementOptions
  appearance?: StripeElementsOptions['appearance']
  [key: string]: any
}

interface StripePaymentFormProps {
  options?: StripePaymentElementOptions
  templateCustomerSaveToWallet?: (props: CustomerSaveToWalletProps) => JSX.Element
  stripe?: Stripe | null
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
}

interface OnSubmitArgs {
  event: HTMLFormElement | null
  stripe: Stripe | null
  elements: StripeElements | null
}

const defaultOptions: StripePaymentElementOptions = {
  layout: {
    type: 'accordion',
    defaultCollapsed: false,
    radios: true,
    spacedAccordionItems: false,
  },
  fields: { billingDetails: 'never' },
}

const defaultAppearance: StripeElementsOptions['appearance'] = {
  theme: 'stripe',
  variables: {
    colorText: '#32325d',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  },
}

function StripePaymentForm({
  options = defaultOptions,
  templateCustomerSaveToWallet,
  stripe,
  onPaymentReady,
  setPaymentRef,
}: StripePaymentFormProps): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null)
  const checkoutCtx = useContext(CheckoutContext)
  const paymentMethod = usePaymentMethodContext()
  const elements = useElements()
  const [isComplete, setIsComplete] = useState(false)

  if (!checkoutCtx) {
    throw new Error('StripePaymentForm must be used within CheckoutProvider')
  }

  const { order, setPayment } = checkoutCtx

  // Set up form submission handler - avoid re-rendering the form
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (formRef.current && stripe && elements) {
      formRef.current.onsubmit = async () => {
        return await onSubmit({
          event: formRef.current,
          stripe,
          elements,
        })
      }
      // Store the form reference for external access
      if (setPaymentRef) {
        setPaymentRef(formRef)
      }
    }
    return () => {
      if (setPaymentRef) {
        setPaymentRef({ current: null })
      }
    }
  }, [formRef, stripe, elements]) // Deliberately limited dependencies

  // Notify parent when payment is ready
  useEffect(() => {
    if (onPaymentReady) {
      onPaymentReady(isComplete && !!stripe && !!elements)
    }
  }, [isComplete, stripe, elements, onPaymentReady])

  const onSubmit = async ({
    event,
    stripe,
    elements,
  }: OnSubmitArgs): Promise<boolean> => {
    if (!stripe || !elements || !order) return false

    try {
      // Check for save to wallet checkbox
      const savePaymentSourceToCustomerWallet: boolean =
        // @ts-expect-error no type available for form elements
        event?.elements?.save_payment_source_to_customer_wallet?.checked ?? false
      
      const billingInfo = order.billing_address
      const email = order.customer_email ?? ''
      
      const billingDetails = {
        name: billingInfo?.full_name ?? '',
        email,
        phone: billingInfo?.phone,
        address: {
          city: billingInfo?.city,
          country: billingInfo?.country_code,
          line1: billingInfo?.line_1,
          line2: billingInfo?.line_2 ?? '',
          postal_code: billingInfo?.zip_code ?? '',
          state: billingInfo?.state_code,
        },
      }

      const url = new URL(window.location.href)
      const cleanUrl = `${url.origin}${url.pathname}?accessToken=${url.searchParams.get('accessToken')}`
      
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: cleanUrl,
          payment_method_data: {
            billing_details: billingDetails,
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        console.error('Stripe payment error:', error)
        return false
      }

      console.log('Stripe payment confirmed successfully')
      console.log('Save to wallet:', savePaymentSourceToCustomerWallet)
      
      return true
    } catch (error) {
      console.error('Payment submission error:', error)
      return false
    }
  }

  const handleChange = async (event: StripePaymentElementChangeEvent) => {
    setIsComplete(event.complete)

    if (event.complete && order) {
      // Additional validation could go here
      // For now, just track completion status
    }
  }

  return (
    <form ref={formRef}>
      <PaymentElement
        id="payment-element"
        options={{ ...defaultOptions, ...options }}
        onChange={handleChange}
      />
      {templateCustomerSaveToWallet && (
        <div className="mt-4">
          {templateCustomerSaveToWallet({
            name: 'save_payment_source_to_customer_wallet'
          })}
        </div>
      )}
    </form>
  )
}

export interface StripePaymentProps {
  show?: boolean
  publishableKey: string
  clientSecret: string
  locale?: StripeElementLocale
  options?: StripePaymentElementOptions
  appearance?: StripeElementsOptions['appearance']
  containerClassName?: string
  templateCustomerSaveToWallet?: (props: CustomerSaveToWalletProps) => JSX.Element
  connectedAccount?: string
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
}

export function StripePayment({
  publishableKey,
  show = true,
  options,
  clientSecret,
  locale = 'auto',
  connectedAccount,
  containerClassName,
  templateCustomerSaveToWallet,
  appearance,
  onPaymentReady,
  setPaymentRef,
  ...divProps
}: StripePaymentProps): JSX.Element | null {
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripe, setStripe] = useState<Stripe | null>(null)

  // Load Stripe when component shows - avoid refreshing the stripe object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (show && publishableKey) {
      import('@stripe/stripe-js').then(({ loadStripe }) => {
        const getStripe = async (): Promise<void> => {
          const options = {
            locale,
            ...(connectedAccount ? { stripeAccount: connectedAccount } : {}),
          } satisfies StripeConstructorOptions
          
          const res = await loadStripe(publishableKey, options)
          if (res != null) {
            setStripe(res)
            setIsLoaded(true)
          }
        }
        getStripe().catch(console.error)
      })
    }
    
    return () => {
      setIsLoaded(false)
    }
  }, [show, publishableKey, connectedAccount]) // Deliberately exclude locale

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: { ...defaultAppearance, ...appearance },
  }

  if (!show || !isLoaded || !stripe || !clientSecret) {
    return null
  }

  return (
    <div className={containerClassName} {...divProps}>
      <Elements stripe={stripe} options={elementsOptions}>
        <StripePaymentForm
          stripe={stripe}
          options={options}
          templateCustomerSaveToWallet={templateCustomerSaveToWallet}
          onPaymentReady={onPaymentReady}
          setPaymentRef={setPaymentRef}
        />
      </Elements>
    </div>
  )
}

export default StripePayment
