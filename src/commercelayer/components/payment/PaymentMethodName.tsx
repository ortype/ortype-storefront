import React, { type ReactNode } from 'react'
import { usePaymentMethodContext } from './PaymentMethod'

interface PaymentMethodNameProps {
  children?: (props: { htmlFor: string; labelName: string }) => ReactNode
}

export const PaymentMethodName: React.FC<PaymentMethodNameProps> = ({
  children,
}) => {
  const paymentMethod = usePaymentMethodContext()
  
  if (!paymentMethod) {
    return null
  }

  const labelName = getPaymentMethodDisplayName(paymentMethod.payment_source_type)
  const htmlFor = `payment-method-${paymentMethod.id}`

  if (children && typeof children === 'function') {
    return <>{children({ htmlFor, labelName })}</>
  }

  return (
    <label htmlFor={htmlFor}>
      {labelName}
    </label>
  )
}

// Helper function to get payment method display name
function getPaymentMethodDisplayName(paymentSourceType: string): string {
  const nameMap: Record<string, string> = {
    'credit_cards': 'Credit Card',
    'stripe_payments': 'Credit Card',
    'paypal_payments': 'PayPal',
    'wire_transfers': 'Wire Transfer',
    'adyen_payments': 'Credit Card',
    'braintree_payments': 'Credit Card',
    'checkout_com_payments': 'Credit Card',
    'external_payments': 'External Payment',
  }
  
  return nameMap[paymentSourceType] || 'Payment Method'
}

export default PaymentMethodName
