import {
  PaymentMethod,
  PaymentSource,
  type CustomerSaveToWalletProps,
} from '@/commercelayer/components'
import { MouseEvent, useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RadioGroup, Radio } from '@/components/ui/radio'
import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react'

import { PaymentDetails } from './payment-details'
import { PaymentSummaryList } from './payment-summary-list'

import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'

// Import the new payment source components
import { StripePayment, WireTransferPayment } from '@/commercelayer/components/payment-sources'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'

interface Props {
  selectPayment: any
  hasTitle: boolean
  autoSelectCallback: () => void
}

type TTemplateCustomerCards = Parameters<
  typeof PaymentSource
>[0]['templateCustomerCards']

export const CheckoutCustomerPayment: React.FC<Props> = ({
  selectPayment,
  hasTitle,
  autoSelectCallback,
}) => {
  const { t } = useTranslation()
  const checkoutCtx = useContext(CheckoutContext)
  
  // State for selected payment method ID
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [checked, setChecked] = useState(false)

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

  // Auto-select if there's a currently selected payment method
  useEffect(() => {
    if (paymentMethod?.id && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethod.id)
    }
  }, [paymentMethod, selectedPaymentMethod])

  // Auto-select single payment method
  useEffect(() => {
    if (paymentMethods.length === 1 && !selectedPaymentMethod) {
      const method = paymentMethods[0]
      setSelectedPaymentMethod(method.id)
      selectPayment({
        payment: method,
        paymentSource: order?.payment_source,
      })
      autoSelectCallback()
    }
  }, [paymentMethods, selectedPaymentMethod, selectPayment, order, autoSelectCallback])

  const handlePaymentMethodSelection = (methodId: string) => {
    console.log('Payment method selection:', methodId)
    const method = paymentMethods.find(pm => pm.id === methodId)
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
    return paymentMethods.find(pm => pm.id === selectedPaymentMethod)
  }

  const TemplateSaveToWalletCheckbox = ({
    name,
  }: CustomerSaveToWalletProps) => {
    const handleClick = (
      e: MouseEvent<HTMLInputElement, globalThis.MouseEvent>
    ) => e?.stopPropagation()
    const handleChange = () => {
      setChecked(!checked)
    }

    return (
      <div className="flex items-center mt-4">
        <Field label={t('stepPayment.saveToWallet')}>
          <Checkbox
            name={name}
            id={name}
            data-testid="save-to-wallet"
            type="checkbox"
            className="form-checkbox"
            checked={checked}
            onClick={handleClick}
            onChange={handleChange}
          />
        </Field>
      </div>
    )
  }

  // Component to render the appropriate payment form based on payment method type
  const PaymentMethodForm: React.FC<{ paymentMethod: any }> = ({ paymentMethod }) => {
    console.log('PaymentMethodForm rendering with paymentMethod:', paymentMethod)
    console.log('Current order payment_source:', order?.payment_source)
    
    if (!paymentMethod) {
      console.log('PaymentMethodForm: No payment method provided')
      return null
    }

    const paymentSourceType = paymentMethod.payment_source_type
    console.log('PaymentMethodForm: paymentSourceType:', paymentSourceType)

    switch (paymentSourceType) {
      case 'stripe_payments':
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
        // Get clientSecret from the order's payment_source, not from the payment method
        const clientSecret = order?.payment_source?.client_secret || ''
        
        console.log('Stripe payment method details:', {
          publishableKey: publishableKey ? 'Present' : 'Missing',
          clientSecret: clientSecret ? 'Present' : 'Missing',
          orderPaymentSource: order?.payment_source,
          paymentSourceType: order?.payment_source?.type
        })
        
        // Only show the Stripe form if we have both publishableKey and clientSecret
        if (!publishableKey) {
          return (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
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
          <StripePayment
            publishableKey={publishableKey}
            clientSecret={clientSecret}
            containerClassName="mt-4"
            templateCustomerSaveToWallet={TemplateSaveToWalletCheckbox}
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
                defaultValue: 'After placing the order, you will need to manually complete the payment with your bank'
              }),
              className: 'text-sm text-blue-700'
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
      {hasTitle && (
        <Text fontSize="lg" fontWeight="semibold">
          {t('stepPayment.title', 'Select Payment Method')}
        </Text>
      )}
      
      {paymentMethods.length > 1 ? (
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
      ) : (
        paymentMethods.length === 1 && (
          <Text>
            {t('stepPayment.singleMethod', 'Payment method: ')} 
            {paymentMethods[0].name || paymentMethods[0].payment_source_type}
          </Text>
        )
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
      {selectedMethod && (
        <PaymentMethodForm paymentMethod={selectedMethod} />
      )}
    </VStack>
  )
}
