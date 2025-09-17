import '@adyen/adyen-web/dist/adyen.css'
import { Box, Heading, VStack } from '@chakra-ui/react'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { useContext, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { CheckoutSummary } from '../checkout-summary'
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

  const { isPaymentRequired, setPayment } = checkoutCtx

  const { t } = useTranslation()

  useEffect(() => {
    // If single payment methods and has multiple payment methods, we hide the label of the box
    if (autoSelected && hasMultiplePaymentMethods) {
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
    <VStack gap={4} mb={4} align="start" w="full">
      <CheckoutSummary
        showEmail={true}
        showBillingAddress={true}
        showLicenseOwner={true}
        heading={t('stepPayment.summaryHeading', 'Order Details')}
      />

      <Box w="full">
        <Heading
          as={'h5'}
          fontSize={'xl'}
          textTransform={'uppercase'}
          fontWeight={'normal'}
          mb={1}
        >
          {'Payment methods'}
        </Heading>
        {isPaymentRequired ? (
          <CheckoutCustomerPayment
            selectPayment={selectPayment}
            autoSelectCallback={autoSelectCallback}
          />
        ) : (
          <p className="text-sm text-gray-400">{t('stepPayment.amountZero')}</p>
        )}
      </Box>
    </VStack>
  )
}
