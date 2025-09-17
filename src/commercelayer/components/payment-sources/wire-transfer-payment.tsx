import { useContext, useEffect, useRef, type JSX } from 'react'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Alert } from '@chakra-ui/react'
import { usePaymentMethodContext } from '../payment/payment-method'

export interface WireTransferConfig {
  infoMessage?: {
    text?: string | JSX.Element[]
    className?: string
  }
}

const defaultMessage =
  'After placing the order, you will need to manually complete the payment with your bank'

export interface WireTransferPaymentProps extends WireTransferConfig {
  show?: boolean
  className?: string
  containerClassName?: string
  'data-testid'?: string
  onPaymentReady?: (ready: boolean) => void
}

export function WireTransferPayment({
  infoMessage,
  show = true,
  className,
  containerClassName,
  'data-testid': dataTestId,
  onPaymentReady,
  ...divProps
}: WireTransferPaymentProps): JSX.Element | null {
  const formRef = useRef<HTMLFormElement>(null)
  const checkoutCtx = useContext(CheckoutContext)
  const paymentMethod = usePaymentMethodContext()

  if (!checkoutCtx) {
    throw new Error('WireTransferPayment must be used within CheckoutProvider')
  }

  const { order, setPayment } = checkoutCtx

  // Set up form submission handler
  useEffect(() => {
    if (formRef.current && paymentMethod) {
      formRef.current.onsubmit = async (e) => {
        e.preventDefault()
        return await handleSubmit()
      }
    }
  }, [paymentMethod])

  // Notify parent that wire transfer is always ready
  useEffect(() => {
    if (onPaymentReady) {
      onPaymentReady(true)
    }
  }, [onPaymentReady])

  const handleSubmit = async (): Promise<boolean> => {
    if (!paymentMethod || !order) return false

    try {
      // For wire transfer, we just need to set the payment method
      // The actual payment processing happens outside the system
      if (setPayment) {
        await setPayment({
          payment: paymentMethod,
          order,
        })
      }

      return true
    } catch (error) {
      console.error('Wire transfer payment error:', error)
      return false
    }
  }

  if (!show) {
    return null
  }

  return (
    <form ref={formRef}>
      <Alert.Root variant={'solid'} status={'info'}>
        <Alert.Indicator />
        <Alert.Title>
          You will receive detailed wire transfer instructions via email after
          completing your order.
        </Alert.Title>
      </Alert.Root>
    </form>
  )
}

export default WireTransferPayment
