import React, {
  useContext,
  useState,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { Order } from '@commercelayer/sdk'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { useStepsContext } from '@chakra-ui/react'

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
  const stepsContext = useStepsContext()

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading, placeOrder, submitRegisteredPayment } = checkoutCtx

  const canPlaceOrder = order && !isLoading && !isPlacing && !disabled

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!canPlaceOrder || !order) {
      return
    }

    try {
      setIsPlacing(true)

      // Submit any registered payment form (e.g., Stripe) before placing order
      console.log('Submitting registered payment form...')
      const paymentSuccess = await submitRegisteredPayment()

      if (!paymentSuccess) {
        console.error('Payment submission failed')
        if (onClick) {
          onClick({ placed: false, order })
        }
        return
      }

      console.log('Payment confirmed, proceeding with order placement')

      // Call the checkout provider's placeOrder method
      await placeOrder(order)

      console.log('Order placed successfully, advancing to completed step')
      
      // Advance to the completed step using the Steps context
      if (stepsContext) {
        // Set to a step index beyond the last step to trigger completed content
        const totalSteps = stepsContext.count
        stepsContext.setStep(totalSteps)
      }

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
