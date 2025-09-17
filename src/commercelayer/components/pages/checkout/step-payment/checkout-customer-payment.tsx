import {
  PaymentMethod,
  PaymentSource,
  type CustomerSaveToWalletProps,
} from '@/commercelayer/components'
import { Box, VStack } from '@chakra-ui/react'
import { MouseEvent, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentDetails } from './payment-details'
import { PaymentMethodContainer } from './payment-method-container'

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'

interface Props {
  selectPayment: any
  autoSelectCallback: () => void
}

type TTemplateCustomerCards = Parameters<
  typeof PaymentSource
>[0]['templateCustomerCards']

export const CheckoutCustomerPayment: React.FC<Props> = ({
  selectPayment,
  autoSelectCallback,
}) => {
  const { t } = useTranslation()
  const checkoutCtx = useContext(CheckoutContext)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null)

  // Reference to store the payment form for programmatic submission
  const paymentFormRef = useRef<HTMLFormElement | null>(null)

  if (!checkoutCtx) {
    return null
  }

  const { order } = checkoutCtx

  if (!order) {
    return <div>No order available</div>
  }

  // Store payment form reference for potential programmatic submission
  const setPaymentRef = (ref: React.RefObject<HTMLFormElement>) => {
    paymentFormRef.current = ref.current
  }

  const TemplateSaveToWalletCheckbox = ({
    name,
  }: CustomerSaveToWalletProps) => {
    const handleClick = (
      e: MouseEvent<HTMLLabelElement, globalThis.MouseEvent>
    ) => e?.stopPropagation()

    // Use uncontrolled checkbox to prevent parent re-renders
    return (
      <Field label={t('stepPayment.saveToWallet') || 'Save to wallet'}>
        <Checkbox
          name={name}
          id={name}
          data-testid="save-to-wallet"
          className="form-checkbox"
          defaultChecked={false}
          onClick={handleClick}
          // Remove onChange handler to prevent state updates
        />
      </Field>
    )
  }

  // Handle payment method selection from card clicks
  const handlePaymentMethodSelection = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod)
    selectPayment({
      payment: paymentMethod,
      paymentSource: order?.payment_source,
    })
  }

  return (
    <>
      <PaymentMethod autoSelectSinglePaymentMethod>
        <PaymentMethodContainer
          selectedPaymentMethodId={selectedPaymentMethod?.id}
          order={order}
          templateSaveToWallet={TemplateSaveToWalletCheckbox}
          onPaymentRef={setPaymentRef}
          onCardClick={handlePaymentMethodSelection}
        />
      </PaymentMethod>

      {/* Render existing PaymentSource for saved customer cards */}
      {/*<PaymentSource className="flex flex-col w-full" loader={<div />}>
        <Box>
          <PaymentDetails hasEditButton />
        </Box>
      </PaymentSource>*/}
    </>
  )
}
