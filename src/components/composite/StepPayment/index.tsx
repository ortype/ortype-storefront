import '@adyen/adyen-web/dist/adyen.css'
import {
  PaymentSource,
  PaymentSourceBrandIcon,
  PaymentSourceBrandName,
  PaymentSourceDetail,
} from '@commercelayer/react-components'
import { Box } from '@chakra-ui/react'
import { PaymentMethod as PaymentMethodType } from '@commercelayer/sdk'
import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { AccordionContext } from '@/components/data/AccordionProvider'
import { CheckoutContext } from '@/components/data/CheckoutProvider'
import { StepContainer } from '@/components/ui/StepContainer'
import { StepHeader } from '@/components/ui/StepHeader'
import { CheckoutCustomerPayment } from './CheckoutCustomerPayment'
import { CheckoutPayment } from './CheckoutPayment'

export type THandleClick = (params: {
  payment?: PaymentMethodType | Record<string, any>
  paymentSource?: Record<string, any>
}) => void

interface HeaderProps {
  className?: string
  step: number
  info?: string
}

export const StepHeaderPayment: React.FC<HeaderProps> = ({ step }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  const { hasPaymentMethod, isPaymentRequired, isCreditCard } = checkoutCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (!isPaymentRequired) {
      return t('stepPayment.notRequired')
    }
    if (!hasPaymentMethod || accordionCtx.status === 'edit') {
      return t('stepPayment.methodUnselected')
    }

    return (
      <>
        <div className="flex">
          <PaymentSource readonly loader={<div />}>
            <PaymentSourceBrandIcon className="mr-2" />
            <PaymentSourceBrandName className="mr-1">
              {({ brand }) => {
                if (isCreditCard) {
                  return (
                    <Trans i18nKey="stepPayment.endingIn">
                      {brand}
                      <PaymentSourceDetail className="ml-1" type="last4" />
                    </Trans>
                  )
                }
                return <>{brand}</>
              }}
            </PaymentSourceBrandName>
          </PaymentSource>
        </div>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t('stepPayment.title')}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepPayment: React.FC = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  const [hasMultiplePaymentMethods, setHasMultiplePaymentMethods] =
    useState(false)
  const [autoSelected, setAutoselected] = useState(false)
  const [hasTitle, setHasTitle] = useState(true)

  const { t } = useTranslation()

  // if (!checkoutCtx || !checkoutCtx.hasShippingMethod) {
  // this exit on shippingMethod is causing an error in useEffect to enable button
  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  useEffect(() => {
    // If single payment methods and has multiple payment methods, we hide the label of the box
    if (autoSelected && hasMultiplePaymentMethods) {
      setHasTitle(false)
    }
  }, [autoSelected, hasMultiplePaymentMethods])

  const { isGuest, isPaymentRequired, setPayment } = checkoutCtx

  const selectPayment: THandleClick = async ({ payment, paymentSource }) => {
    if (paymentSource?.payment_methods?.paymentMethods?.length > 1) {
      setHasMultiplePaymentMethods(true)
    }
    setPayment({ payment: payment as PaymentMethodType })
  }

  const autoSelectCallback = async () => {
    setAutoselected(true)
  }

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
      })}
    >
      <Box>
        <>
          {accordionCtx.isActive && (
            <div>
              {isPaymentRequired ? (
                isGuest ? (
                  <CheckoutPayment
                    selectPayment={selectPayment}
                    autoSelectCallback={autoSelectCallback}
                    hasTitle={hasTitle}
                  />
                ) : (
                  <CheckoutCustomerPayment
                    selectPayment={selectPayment}
                    autoSelectCallback={autoSelectCallback}
                    hasTitle={hasTitle}
                  />
                )
              ) : (
                <p className="text-sm text-gray-400">
                  {t('stepPayment.amountZero')}
                </p>
              )}
            </div>
          )}
        </>
      </Box>
    </StepContainer>
  )
}
