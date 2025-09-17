import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'
import { Box, Button, Flex, Show, Stack, Text, VStack } from '@chakra-ui/react'

interface PaymentMethodCardProps {
  isSelected: boolean
  isLoading: boolean
  onCardClick: () => void
  children?: React.ReactNode
}

// Helper function to get payment method display name
function getPaymentMethodDisplayName(paymentSourceType: string): string {
  const nameMap: Record<string, string> = {
    credit_cards: 'Credit Card',
    stripe_payments: 'Credit Card',
    paypal_payments: 'PayPal',
    wire_transfers: 'Wire Transfer',
    adyen_payments: 'Credit Card',
    braintree_payments: 'Credit Card',
    checkout_com_payments: 'Credit Card',
    external_payments: 'External Payment',
  }

  return nameMap[paymentSourceType] || 'Payment Method'
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  isSelected,
  isLoading,
  onCardClick,
  children,
}) => {
  const paymentMethod = usePaymentMethodContext()

  // NEVER return null - always render card structure
  const displayName = paymentMethod
    ? getPaymentMethodDisplayName(paymentMethod.payment_source_type)
    : 'Loading...'

  const handleCardClick = () => {
    if (paymentMethod) {
      onCardClick()
    }
  }

  // Handle loading state
  if (isLoading) {
    return (
      <VStack align="stretch" spacing={0}>
        <Flex bg={'brand.50'} p={4} justifyContent={'space-between'}>
          <Stack direction={'row'} gap={2} alignItems={'center'}>
            <Button
              variant={'circle'}
              w={6}
              borderWidth={'2px'}
              h={6}
              minW={6}
              p={0}
              bg={'gray.200'}
              isDisabled
              opacity={0.6}
            />
            <Box bg="gray.200" height="6" width="32" borderRadius="md" />
          </Stack>
          <Box bg="gray.200" height="4" width="16" borderRadius="sm" />
        </Flex>
      </VStack>
    )
  }

  return (
    <VStack align="stretch" w={'full'} gap={0}>
      <Flex
        bg={'brand.50'}
        p={4}
        justifyContent={'space-between'}
        cursor={'pointer'}
        onClick={handleCardClick}
        _hover={{ bg: 'brand.100' }}
        transition="background-color 0.2s"
      >
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          <Button
            variant={'circle'}
            w={6}
            borderWidth={'2px'}
            h={6}
            minW={6}
            p={0}
            bg={isSelected ? 'black' : 'white'}
            pointerEvents="none"
          />
          <Text fontSize={'2xl'} as={'span'}>
            {displayName}
          </Text>
        </Stack>
        {/*<Flex alignItems={'center'}>
          {paymentMethod?.price_amount_cents && paymentMethod.price_amount_cents > 0 && (
            <Text as={'span'} color={'brand.400'}>
              +{(paymentMethod.price_amount_cents / 100).toFixed(2)}{' '}
              {paymentMethod.currency_code || 'USD'}
            </Text>
          )}
        </Flex>*/}
      </Flex>
      <Box bg={'brand.50'} mb={2} p={4}>
        <Show when={isSelected}>{children}</Show>
      </Box>
    </VStack>
  )
}
