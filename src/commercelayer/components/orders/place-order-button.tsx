import React, { useContext, useState, type ReactNode, type MouseEvent } from 'react'
import { Order } from '@commercelayer/sdk'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

interface PlaceOrderButtonProps {
  className?: string
  children?: ReactNode
  label?: string
  onClick?: (params: { placed: boolean; order?: Order }) => void
  disabled?: boolean
}

export const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({
  className,
  children,
  label = 'Place Order',
  onClick,
  disabled,
  ...props
}) => {
  const [isPlacing, setIsPlacing] = useState(false)
  const checkoutCtx = useContext(CheckoutContext)

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading, placeOrder } = checkoutCtx

  const canPlaceOrder = order && !isLoading && !isPlacing && !disabled

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    if (!canPlaceOrder || !order) {
      return
    }

    try {
      setIsPlacing(true)
      
      // Check if this is a Stripe payment that needs form submission first
      const isStripePayment = order?.payment_source?.type === 'stripe_payments'
      
      if (isStripePayment) {
        console.log('Stripe payment detected - submitting payment form first')
        
        // Get the Stripe payment form submission function
        // @ts-expect-error - Temporary access to global Stripe form method
        const submitStripePayment = (window as any).submitStripePayment
        
        if (submitStripePayment) {
          console.log('Submitting Stripe payment form...')
          const paymentSuccess = await submitStripePayment()
          
          if (!paymentSuccess) {
            console.error('Stripe payment failed')
            if (onClick) {
              onClick({ placed: false, order })
            }
            return
          }
          
          console.log('Stripe payment confirmed, proceeding with order placement')
        } else {
          console.error('Stripe payment form not available')
          if (onClick) {
            onClick({ placed: false, order })
          }
          return
        }
      }
      
      // Call the checkout provider's placeOrder method
      await placeOrder(order)
      
      // Notify parent component
      if (onClick) {
        onClick({ placed: true, order })
      }
    } catch (error) {
      console.error('Error placing order:', error)
      
      // Notify parent component of failure
      if (onClick) {
        onClick({ placed: false, order })
      }
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
      disabled={!canPlaceOrder}
      {...props}
    >
      {children || (isPlacing ? 'Placing Order...' : label)}
    </button>
  )
}

export default PlaceOrderButton
