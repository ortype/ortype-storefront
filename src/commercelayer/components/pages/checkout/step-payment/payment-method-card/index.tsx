import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'
import { Box, Button, Flex, Show, Stack, Text, VStack } from '@chakra-ui/react'
import { memo } from 'react'

interface PaymentMethodCardProps {
  isSelected: boolean
  onCardClick: () => void
  children?: React.ReactNode
  isSinglePaymentMethod?: boolean
}

// Helper function to get payment method display name
function getPaymentMethodDisplayName(paymentSourceType: string): string {
  const nameMap: Record<string, string> = {
    credit_cards: 'Credit card',
    stripe_payments: 'Credit card',
    paypal_payments: 'PayPal',
    wire_transfers: 'Bank transfer',
    adyen_payments: 'Credit card',
    braintree_payments: 'Credit card',
    checkout_com_payments: 'Credit card',
    external_payments: 'External Payment',
  }

  return nameMap[paymentSourceType] || 'Payment Method'
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = memo(
  ({ isSelected, onCardClick, children, isSinglePaymentMethod }) => {
    const paymentMethod = usePaymentMethodContext()

    // Payment methods are cached - paymentMethod should always exist
    // If it doesn't exist, something is wrong with the context
    if (!paymentMethod) {
      console.warn('PaymentMethodCard: paymentMethod is null')
      return null
    }

    const displayName = getPaymentMethodDisplayName(
      paymentMethod.payment_source_type
    )

    const handleCardClick = () => {
      if (!isSinglePaymentMethod) {
        onCardClick()
      }
    }

    return (
      <VStack align="stretch" w={'full'} gap={0}>
        {!isSinglePaymentMethod && (
          <Flex
            bg={'brand.50'}
            p={4}
            justifyContent={'space-between'}
            cursor={'pointer'}
            onClick={handleCardClick}
            _hover={{
              bg: 'brand.100',
              '& .indicator': {
                bg: 'black',
              },
            }}
            transition="background-color 0.2s"
          >
            <Stack direction={'row'} gap={2} alignItems={'center'}>
              <Button
                className={'indicator'}
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
        )}
        <Box pt={1} />
        <Show when={isSelected}>{children}</Show>
      </VStack>
    )
  }
)

PaymentMethodCard.displayName = 'PaymentMethodCard'
