import {
  PaymentMethod,
  PaymentSource,
  type CustomerSaveToWalletProps,
} from '@/commercelayer/components'
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

import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Checkbox } from '@/components/ui/checkbox'
import { setCustomerOrderParam } from '@/utils/localStorage'
import { Card } from '@chakra-ui/react'
import { PaymentMethodContainer } from './payment-method-container'

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

    const { order } = checkoutCtx

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

      const handleChange = (e: { checked: boolean }) => {
        setCustomerOrderParam(
          '_save_payment_source_to_customer_wallet',
          e.checked ? 'true' : 'false'
        )
      }

      return (
        <Card.Root w={'full'}>
          <Card.Body p={3}>
            <Checkbox
              name={name}
              id={name}
              data-testid="save-to-wallet"
              className="form-checkbox"
              defaultChecked={false}
              onClick={handleClick}
              onCheckedChange={handleChange}
              variant={'outline'}
              size={'sm'}
            >
              {t('stepPayment.saveToWallet') || 'Save to wallet'}
            </Checkbox>
          </Card.Body>
        </Card.Root>
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

    const isSinglePaymentMethod =
      (order.available_payment_methods?.length ?? 0) === 1

    return (
      <>
        {/* 
          @TODO: Render existing PaymentSource for saved customer cards
        */}
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
            isSinglePaymentMethod={isSinglePaymentMethod}
          />
        </PaymentMethod>
      </>
    )
  }
)

CheckoutCustomerPayment.displayName = 'CheckoutCustomerPayment'
