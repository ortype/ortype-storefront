/**
 * Types for custom credit card form implementation
 */

export interface CreditCardFormData {
  cardNumber: string
  expiryDate: string  // MM/YY format
  cvc: string
  cardholderName: string
  saveToWallet?: boolean
}

export interface CreditCardErrors {
  cardNumber?: string
  expiryDate?: string
  cvc?: string
  cardholderName?: string
  general?: string
}

export interface CustomStripePaymentProps {
  publishableKey: string
  clientSecret: string
  locale?: any
  connectedAccount?: string
  containerClassName?: string
  templateCustomerSaveToWallet?: (props: { name: string }) => JSX.Element
  onPaymentReady?: (ready: boolean) => void
  setPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
  show?: boolean
  useCustomForm?: boolean // Feature flag to toggle between Elements and custom form
}

export interface StripePaymentMethodData {
  type: 'card'
  card: {
    number: string
    exp_month: number
    exp_year: number
    cvc: string
  }
  billing_details?: {
    name?: string
    email?: string
    phone?: string
    address?: {
      city?: string
      country?: string
      line1?: string
      line2?: string
      postal_code?: string
      state?: string
    }
  }
}
