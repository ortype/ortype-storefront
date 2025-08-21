import React from 'react'
import { usePaymentSourceContext } from './payment-source'
import { getCardBrand } from './utils/get-card-brand'

interface PaymentSourceBrandIconProps {
  className?: string
}

export const PaymentSourceBrandIcon: React.FC<PaymentSourceBrandIconProps> = ({
  className,
}) => {
  const paymentSource = usePaymentSourceContext()

  if (!paymentSource) {
    return null
  }

  const brand = getCardBrand(paymentSource)

  // You can customize this to use actual brand icons
  // For now, using a simple text representation
  return (
    <span className={className} data-brand={brand}>
      {getBrandIcon(brand)}
    </span>
  )
}

// Helper function to get brand icon (you can replace with actual icons)
function getBrandIcon(brand: string): string {
  const iconMap: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    american_express: '💳',
    amex: '💳',
    discover: '💳',
    paypal: '🅿️',
    stripe: '💳',
    credit_card: '💳',
    'credit-card': '💳',
    default: '💳',
  }

  return iconMap[brand?.toLowerCase()] || iconMap.default
}

export default PaymentSourceBrandIcon
