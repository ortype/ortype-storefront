import '@adyen/adyen-web/dist/adyen.css'
import { Box } from '@chakra-ui/react'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { useContext, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { CheckoutCustomerPayment } from './checkout-customer-payment'

export type THandleClick = (params: {
  payment?: PaymentMethodType | Record<string, any>
  paymentSource?: Record<string, any>
}) => void

interface HeaderProps {
  className?: string
  step: number
  info?: string
}

export const StepPayment: React.FC = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const [hasMultiplePaymentMethods, setHasMultiplePaymentMethods] =
    useState(false)
  const [autoSelected, setAutoselected] = useState(false)
  const [hasTitle, setHasTitle] = useState(true)

  const { isPaymentRequired, setPayment } = checkoutCtx

  const { t } = useTranslation()

  useEffect(() => {
    // If single payment methods and has multiple payment methods, we hide the label of the box
    if (autoSelected && hasMultiplePaymentMethods) {
      setHasTitle(false)
    }
  }, [autoSelected, hasMultiplePaymentMethods])

  const selectPayment: THandleClick = async ({ payment, paymentSource }) => {
    console.log('selectPayment called with:', { payment, paymentSource })
    if (paymentSource?.payment_methods?.paymentMethods?.length > 1) {
      setHasMultiplePaymentMethods(true)
    }
    console.log('Calling setPayment with:', {
      payment: payment as PaymentMethodType,
    })
    setPayment({ payment: payment as PaymentMethodType })
  }

  const autoSelectCallback = async () => {
    setAutoselected(true)
  }

  // if (!checkoutCtx || !checkoutCtx.hasShippingMethod) {
  // this exit on shippingMethod is causing an error in useEffect to enable button
  if (!checkoutCtx) {
    return null
  }

  return (
    <Box>
      <>
        <div>
          {isPaymentRequired ? (
            <CheckoutCustomerPayment
              selectPayment={selectPayment}
              autoSelectCallback={autoSelectCallback}
              hasTitle={hasTitle}
            />
          ) : (
            <p className="text-sm text-gray-400">
              {t('stepPayment.amountZero')}
            </p>
          )}
        </div>
      </>
    </Box>
  )
}
