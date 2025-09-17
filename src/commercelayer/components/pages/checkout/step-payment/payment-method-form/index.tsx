import { Box, Text } from '@chakra-ui/react'
import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'
import { type CustomerSaveToWalletProps } from '@/commercelayer/components'
import { StripePaymentForm } from '../stripe-payment-form'
import { WireTransferForm } from '../wire-transfer-form'
import { memo } from 'react'

interface PaymentMethodFormProps {
  order: any
  templateSaveToWallet?: React.ComponentType<CustomerSaveToWalletProps>
  onPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
  isVisible?: boolean
}

export const PaymentMethodForm = memo<PaymentMethodFormProps>(({
  order,
  templateSaveToWallet,
  onPaymentRef,
  isVisible = true,
}) => {
  const paymentMethod = usePaymentMethodContext()

  // Handle loading states gracefully instead of returning null
  if (!paymentMethod) {
    return (
      <Box
        p={4}
        bg="blue.50"
        border="1px solid"
        borderColor="blue.200"
        borderRadius="md"
      >
        <Text fontSize="sm" color="blue.800">
          Loading payment method...
        </Text>
      </Box>
    )
  }

  if (!order) {
    return (
      <Box
        p={4}
        bg="orange.50"
        border="1px solid"
        borderColor="orange.200"
        borderRadius="md"
      >
        <Text fontSize="sm" color="orange.800">
          Order not available
        </Text>
      </Box>
    )
  }

  const paymentSourceType = paymentMethod.payment_source_type

  switch (paymentSourceType) {
    case 'stripe_payments':
      return (
        <StripePaymentForm
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
          clientSecret={order?.payment_source?.client_secret || ''}
          templateSaveToWallet={templateSaveToWallet}
          onPaymentRef={onPaymentRef}
        />
      )

    case 'wire_transfers':
      return <WireTransferForm />

    default:
      console.log('❓ Unknown payment method type:', paymentSourceType)
      return (
        <Box
          p={4}
          bg="gray.50"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Text fontSize="sm" color="gray.600">
            Payment method: {paymentSourceType || 'Unknown'}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            This payment method is not yet supported in the UI.
          </Text>
        </Box>
      )
  }
})

PaymentMethodForm.displayName = 'PaymentMethodForm'
