import React, { type ReactNode } from 'react'
import { usePaymentSourceContext } from './payment-source'
import { getCardBrand } from './utils/get-card-brand'

interface PaymentSourceBrandNameProps {
  className?: string
  children?: (props: { brand: string }) => ReactNode
}

export const PaymentSourceBrandName: React.FC<PaymentSourceBrandNameProps> = ({
  className,
  children,
}) => {
  const paymentSource = usePaymentSourceContext()

  if (!paymentSource) {
    return null
  }

  const brand = getCardBrand(paymentSource)
  const displayName = getBrandDisplayName(brand)

  if (children && typeof children === 'function') {
    return <span className={className}>{children({ brand: displayName })}</span>
  }

  return <span className={className}>{displayName}</span>
}

// Helper function to get brand display name
function getBrandDisplayName(brand: string): string {
  const nameMap: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    american_express: 'American Express',
    amex: 'American Express',
    discover: 'Discover',
    paypal: 'PayPal',
    stripe: 'Credit Card',
    credit_card: 'Credit Card',
    'credit-card': 'Credit Card',
    wire_transfer: 'Wire Transfer',
    wire_transfers: 'Wire Transfer',
    default: 'Payment Method',
  }

  return nameMap[brand?.toLowerCase()] || nameMap.default
}

export default PaymentSourceBrandName
