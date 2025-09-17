import { Box, Text } from '@chakra-ui/react'
import { CustomStripePayment } from '@/commercelayer/components/payment-sources/custom-credit-card'
import { type CustomerSaveToWalletProps } from '@/commercelayer/components'
import { memo } from 'react'

interface StripePaymentFormProps {
  clientSecret?: string
  publishableKey: string
  templateSaveToWallet?: React.ComponentType<CustomerSaveToWalletProps>
  onPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
}

export const StripePaymentForm = memo<StripePaymentFormProps>(({
  clientSecret,
  publishableKey,
  templateSaveToWallet,
  onPaymentRef,
}) => {
  // Only check for publishable key - let CustomStripePayment handle clientSecret loading
  if (!publishableKey) {
    return (
      <Box
        p={4}
        bg="yellow.50"
        border="1px solid"
        borderColor="yellow.200"
        borderRadius="md"
      >
        <Text fontSize="sm" color="yellow.800">
          Stripe publishable key is not configured. Please set
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
        </Text>
      </Box>
    )
  }

  // Always render CustomStripePayment - it handles its own loading states
  return (
    <CustomStripePayment
      publishableKey={publishableKey}
      clientSecret={clientSecret}
      containerClassName=""
      templateCustomerSaveToWallet={templateSaveToWallet}
      setPaymentRef={onPaymentRef}
      show={true}
    />
  )
})

StripePaymentForm.displayName = 'StripePaymentForm'
