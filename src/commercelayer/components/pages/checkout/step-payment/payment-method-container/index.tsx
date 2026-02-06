import { type CustomerSaveToWalletProps } from '@/commercelayer/components'
import { usePaymentMethodContext } from '@/commercelayer/components/payment/payment-method'
import { memo } from 'react'
import { PaymentMethodCard } from '../payment-method-card'
import { PaymentMethodForm } from '../payment-method-form'

interface PaymentMethodContainerProps {
  selectedPaymentMethodId?: string
  order: any
  templateSaveToWallet?: React.ComponentType<CustomerSaveToWalletProps>
  onPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
  onCardClick: (paymentMethod: any) => void
  isSinglePaymentMethod?: boolean
}

export const PaymentMethodContainer: React.FC<PaymentMethodContainerProps> =
  memo(
    ({
      selectedPaymentMethodId,
      order,
      templateSaveToWallet,
      onPaymentRef,
      onCardClick,
      isSinglePaymentMethod,
    }) => {
      const paymentMethod = usePaymentMethodContext()

      // NEVER return null - always render the card structure
      const isSelected = paymentMethod?.id === selectedPaymentMethodId

      const handleCardClick = () => {
        if (paymentMethod) {
          onCardClick(paymentMethod)
        }
      }

      return (
        <PaymentMethodCard
          isSelected={isSelected}
          onCardClick={handleCardClick}
          isSinglePaymentMethod={isSinglePaymentMethod}
        >
          {/* Always render form to prevent mounting/unmounting flicker */}
          <PaymentMethodForm
            order={order}
            templateSaveToWallet={templateSaveToWallet}
            onPaymentRef={onPaymentRef}
            isVisible={isSelected}
          />
        </PaymentMethodCard>
      )
    }
  )

PaymentMethodContainer.displayName = 'PaymentMethodContainer'
