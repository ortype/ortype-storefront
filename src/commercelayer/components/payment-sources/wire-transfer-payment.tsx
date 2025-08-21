import { useContext, useEffect, useRef, type JSX } from 'react'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
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
    <div className={containerClassName} {...divProps}>
      <form ref={formRef}>
        <div className={className} data-testid={dataTestId}>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p
                  className={`text-sm text-blue-700 ${
                    infoMessage?.className || ''
                  }`}
                >
                  {infoMessage?.text ?? defaultMessage}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Payment Method:</strong> Wire Transfer
            </p>
            <p className="mt-2">
              You will receive detailed wire transfer instructions via email
              after completing your order.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default WireTransferPayment
