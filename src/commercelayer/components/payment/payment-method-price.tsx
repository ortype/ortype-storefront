import React, { useContext } from 'react'
import { usePaymentMethodContext } from './payment-method'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

interface PaymentMethodPriceProps {
  className?: string
  labelFree?: string
}

export const PaymentMethodPrice: React.FC<PaymentMethodPriceProps> = ({
  className,
  labelFree = 'Free',
}) => {
  const paymentMethod = usePaymentMethodContext()
  const checkoutCtx = useContext(CheckoutContext)
  
  if (!paymentMethod || !checkoutCtx) {
    return null
  }

  const { order } = checkoutCtx
  
  // Get the price for this payment method
  const price = getPaymentMethodPrice(paymentMethod, order)
  
  return (
    <span className={className}>
      {price === 0 ? labelFree : formatPrice(price, order?.currency_code)}
    </span>
  )
}

// Helper function to get payment method price
function getPaymentMethodPrice(paymentMethod: any, order: any): number {
  // Check if there's a specific price for this payment method
  if (paymentMethod.price_amount_cents) {
    return paymentMethod.price_amount_cents / 100
  }
  
  // For most payment methods, there's no additional cost
  return 0
}

// Helper function to format price
function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export default PaymentMethodPrice
