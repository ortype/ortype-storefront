import {
  PaymentMethod,
  PaymentSource,
  type CustomerSaveToWalletProps,
} from '@/commercelayer/components'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react'
import { MouseEvent, useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentDetails } from './payment-details'
import { PaymentSummaryList } from './payment-summary-list'

import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'

// Import the payment source components
import { WireTransferPayment } from '@/commercelayer/components/payment-sources'
import { CustomStripePayment } from '@/commercelayer/components/payment-sources/custom-credit-card'
import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

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

  // State for selected payment method ID
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  // Remove checkbox state to prevent re-renders

  // Reference to store the payment form for programmatic submission
  const paymentFormRef = useRef<HTMLFormElement | null>(null)

  if (!checkoutCtx) {
    return null
  }

  const { order, isLoading, loadPaymentMethods, paymentMethod } = checkoutCtx

  // Get payment methods from order
  const paymentMethods = order?.available_payment_methods || []

  // Load payment methods if not available
  useEffect(() => {
    if (!paymentMethods.length && !isLoading && loadPaymentMethods) {
      loadPaymentMethods().catch(console.error)
    }
  }, [paymentMethods.length, isLoading, loadPaymentMethods])

  // Restore previously selected payment method from context if available
  useEffect(() => {
    if (paymentMethod?.id && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethod.id)
    }
  }, [paymentMethod, selectedPaymentMethod])

  // Removed auto-selection - let users choose their payment method manually
  // This ensures payment sources are created properly when user explicitly selects

  const handlePaymentMethodSelection = (methodId: string) => {
    console.log('Payment method selection:', methodId)
    const method = paymentMethods.find((pm) => pm.id === methodId)
    if (method) {
      console.log('Selected payment method:', method)
      setSelectedPaymentMethod(methodId)
      selectPayment({
        payment: method,
        paymentSource: order?.payment_source,
      })
    }
  }

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find((pm) => pm.id === selectedPaymentMethod)
  }

  // Store payment form reference for potential programmatic submission
  const setPaymentRef = (ref: React.RefObject<HTMLFormElement>) => {
    console.log('setPaymentRef called with:', ref.current)
    paymentFormRef.current = ref.current
  }

  const TemplateSaveToWalletCheckbox = ({
    name,
  }: CustomerSaveToWalletProps) => {
    const handleClick = (
      e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>
    ) => e?.stopPropagation()

    // Use uncontrolled checkbox to prevent parent re-renders
    return (
      <div className="flex items-center mt-4">
        <Field label={t('stepPayment.saveToWallet')}>
          <Checkbox
            name={name}
            id={name}
            data-testid="save-to-wallet"
            type="checkbox"
            className="form-checkbox"
            defaultChecked={false}
            onClick={handleClick}
            // Remove onChange handler to prevent state updates
          />
        </Field>
      </div>
    )
  }

  // Component to render the appropriate payment form based on payment method type
  const PaymentMethodForm: React.FC<{ paymentMethod: any }> = ({
    paymentMethod,
  }) => {
    console.log(
      'PaymentMethodForm rendering with paymentMethod:',
      paymentMethod
    )
    console.log('Current order payment_source:', order?.payment_source)

    if (!paymentMethod) {
      console.log('PaymentMethodForm: No payment method provided')
      return null
    }

    const paymentSourceType = paymentMethod.payment_source_type
    console.log('PaymentMethodForm: paymentSourceType:', paymentSourceType)

    switch (paymentSourceType) {
      case 'stripe_payments':
        const publishableKey =
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
        // Get clientSecret from the order's payment_source, not from the payment method
        const clientSecret = order?.payment_source?.client_secret || ''

        console.log('Stripe payment method details:', {
          publishableKey: publishableKey ? 'Present' : 'Missing',
          clientSecret: clientSecret ? 'Present' : 'Missing',
          orderPaymentSource: order?.payment_source,
          paymentSourceType: order?.payment_source?.type,
        })

        // Only show the Stripe form if we have both publishableKey and clientSecret
        if (!publishableKey) {
          return (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Stripe publishable key is not configured. Please set
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
              </p>
            </div>
          )
        }

        if (!clientSecret) {
          return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Setting up Stripe payment...
              </p>
            </div>
          )
        }

        return (
          <CustomStripePayment
            publishableKey={publishableKey}
            clientSecret={clientSecret}
            containerClassName="mt-4"
            templateCustomerSaveToWallet={TemplateSaveToWalletCheckbox}
            setPaymentRef={setPaymentRef}
            show={true}
          />
        )

      case 'wire_transfers':
        console.log('Wire transfer payment method selected')
        return (
          <WireTransferPayment
            containerClassName="mt-4"
            show={true}
            infoMessage={{
              text: t('stepPayment.wireTransferMessage', {
                defaultValue:
                  'After placing the order, you will need to manually complete the payment with your bank',
              }),
              className: 'text-sm text-blue-700',
            }}
          />
        )

      default:
        console.log('Unknown payment method type:', paymentSourceType)
        return (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-sm text-gray-600">
              Payment method: {paymentSourceType || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              This payment method is not yet supported in the UI.
            </p>
          </div>
        )
    }
  }

  if (isLoading) {
    return <div>Loading payment methods...</div>
  }

  const selectedMethod = getSelectedPaymentMethod()

  return (
    <VStack gap={'4'}>
      {/* Always show payment methods as selectable radio buttons */}
      {paymentMethods.length > 0 && (
        <>
          <Text color="gray.600" fontSize="sm">
            {paymentMethods.length === 1
              ? t('stepPayment.selectSingle', 'Select payment method:')
              : t('stepPayment.selectMultiple', 'Choose a payment method:')}
          </Text>
          <RadioGroup
            value={selectedPaymentMethod}
            onValueChange={(e) => handlePaymentMethodSelection(e.value)}
          >
            <VStack gap="4" align="start">
              {paymentMethods.map((method) => (
                <Radio key={method.id} value={method.id}>
                  {method.name || method.payment_source_type}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        </>
      )}

      {/* Render existing PaymentSource for saved customer cards */}
      <PaymentSource
        className="flex flex-col w-full"
        // @ts-expect-error Type 'FC<{}>' is not assignable to type 'LoaderType'.
        loader={<div />}
      >
        <Box>
          <PaymentDetails hasEditButton />
        </Box>
      </PaymentSource>

      {/* Render the specific payment method form for selected method */}
      {selectedMethod && <PaymentMethodForm paymentMethod={selectedMethod} />}
    </VStack>
  )
}
