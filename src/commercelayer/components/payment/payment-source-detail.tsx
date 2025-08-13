import React from 'react'
import { usePaymentSourceContext } from './payment-source'

interface PaymentSourceDetailProps {
  className?: string
  type: 'last4' | 'exp_month' | 'exp_year' | 'name' | 'email'
}

export const PaymentSourceDetail: React.FC<PaymentSourceDetailProps> = ({
  className,
  type,
}) => {
  const paymentSource = usePaymentSourceContext()
  
  if (!paymentSource) {
    return null
  }

  const value = getDetailValue(paymentSource, type)
  
  if (!value) {
    return null
  }

  return (
    <span className={className}>
      {value}
    </span>
  )
}

// Helper function to extract detail values from payment source
function getDetailValue(paymentSource: any, type: string): string | null {
  if (!paymentSource) return null

  switch (type) {
    case 'last4':
      return paymentSource.last4 || paymentSource.card?.last4 || '****'
    case 'exp_month':
      return paymentSource.exp_month || paymentSource.card?.exp_month || paymentSource.month || ''
    case 'exp_year':
      return paymentSource.exp_year || paymentSource.card?.exp_year || paymentSource.year || ''
    case 'name':
      return paymentSource.name || paymentSource.card?.name || paymentSource.card_name || ''
    case 'email':
      return paymentSource.email || ''
    default:
      return null
  }
}

export default PaymentSourceDetail
