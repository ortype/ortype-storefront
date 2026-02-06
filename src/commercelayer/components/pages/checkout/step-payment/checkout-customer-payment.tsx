import {
  PaymentMethod,
  PaymentSource,
  type CustomerSaveToWalletProps,
} from '@/commercelayer/components'
import { Box, VStack } from '@chakra-ui/react'
import {
  memo,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
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

export const CheckoutCustomerPayment: React.FC<Props> = memo(
  ({ selectPayment, autoSelectCallback }) => {
    const { t } = useTranslation()
    const checkoutCtx = useContext(CheckoutContext)
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
      useState<any>(null)

    // Reference to store the payment form for programmatic submission
    const paymentFormRef = useRef<HTMLFormElement | null>(null)

    if (!checkoutCtx) {
      return null
    }

    const { order } = checkoutCtx

    if (!order) {
      return <div>No order available</div>
    }

    // Initialize selected payment method from order on mount
    useEffect(() => {
      if (order.payment_method && !selectedPaymentMethod) {
        setSelectedPaymentMethod(order.payment_method)
      }
    }, [order.payment_method, selectedPaymentMethod])

    // Store payment form reference for potential programmatic submission
    const setPaymentRef = useCallback(
      (ref: React.RefObject<HTMLFormElement>) => {
        paymentFormRef.current = ref.current
      },
      []
    )

    const TemplateSaveToWalletCheckbox = ({
      name,
    }: CustomerSaveToWalletProps) => {
      const handleClick = (
        e: MouseEvent<HTMLLabelElement, globalThis.MouseEvent>
      ) => e?.stopPropagation()

      // Use uncontrolled checkbox to prevent parent re-renders
      return (
        <Field
          //bg={'brand.50'}
          // mt={1}
          h={11}
          px={3}
          justifyContent={'center'}
        >
          <Checkbox
            name={name}
            id={name}
            data-testid="save-to-wallet"
            className="form-checkbox"
            defaultChecked={false}
            onClick={handleClick}
            variant={'outline'}
            size={'lg'}
            // Remove onChange handler to prevent state updates
          >
            {t('stepPayment.saveToWallet') || 'Save to wallet'}
          </Checkbox>
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
        {/* Render existing PaymentSource for saved customer cards */}
        {/*<PaymentSource className="flex flex-col w-full" loader={<div />}>
          <Box>
            <PaymentDetails hasEditButton />
          </Box>
        </PaymentSource>*/}
        <PaymentMethod autoSelectSinglePaymentMethod>
          <PaymentMethodContainer
            selectedPaymentMethodId={selectedPaymentMethod?.id}
            order={order}
            templateSaveToWallet={TemplateSaveToWalletCheckbox}
            onPaymentRef={setPaymentRef}
            onCardClick={handlePaymentMethodSelection}
          />
        </PaymentMethod>
      </>
    )
  }
)

CheckoutCustomerPayment.displayName = 'CheckoutCustomerPayment'
