import { Errors } from '@/commercelayer/components'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import '@adyen/adyen-web/dist/adyen.css'
import {
  Box,
  Card,
  Checkbox,
  Container,
  Flex,
  Heading,
  Link,
  VStack,
} from '@chakra-ui/react'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import { useContext, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CheckoutSummary } from '../checkout-summary'
import { messages } from '../step-place-order/messages'
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
  const [checked, setChecked] = useState(false)

  const { isPaymentRequired, setPayment, setIsPaymentActive, order } =
    checkoutCtx

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
  if (!checkoutCtx || !order) {
    return null
  }

  return (
    <VStack gap={4} align="start" w="full">
      <CheckoutSummary
        showEmail={true}
        showBillingAddress={true}
        showLicenseOwner={true}
        heading={t('stepPayment.summaryHeading', 'Your Details')}
      />
      <Box w="full">
        <Box
          px={3}
          fontSize={'xs'}
          textTransform={'uppercase'}
          color={'#737373'}
          mb={2}
          asChild
        >
          <Flex gap={1} alignItems={'center'}>
            {'Secure payment'}
          </Flex>
        </Box>
        {isPaymentRequired ? (
          <CheckoutCustomerPayment
            selectPayment={selectPayment}
            autoSelectCallback={autoSelectCallback}
          />
        ) : (
          <p className="text-sm text-gray-400">{t('stepPayment.amountZero')}</p>
        )}
      </Box>
      <Box data-testid="errors-container">
        <Errors
          resource="orders"
          messages={
            messages &&
            messages.map((msg) => {
              return { ...msg, message: t(msg.message) }
            })
          }
        >
          {(props) => {
            if (props.errors?.length === 0) {
              return null
            }
            const compactedErrors = props.errors
            return (
              <>
                {compactedErrors?.map((error, index) => {
                  if (error?.trim().length === 0 || !error) {
                    return null
                  }
                  return (
                    <Box key={index}>
                      <Box>{error}</Box>
                    </Box>
                  )
                })}
              </>
            )
          }}
        </Errors>
      </Box>
    </VStack>
  )
}
