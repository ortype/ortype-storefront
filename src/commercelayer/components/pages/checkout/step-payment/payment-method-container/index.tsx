import { type CustomerSaveToWalletProps } from '@/commercelayer/components'
import {
  usePaymentMethodContext,
  usePaymentMethodLoading,
} from '@/commercelayer/components/payment/payment-method'
import { PaymentMethodCard } from '../payment-method-card'
import { PaymentMethodForm } from '../payment-method-form'

interface PaymentMethodContainerProps {
  selectedPaymentMethodId?: string
  order: any
  templateSaveToWallet?: React.ComponentType<CustomerSaveToWalletProps>
  onPaymentRef?: (ref: React.RefObject<HTMLFormElement>) => void
  onCardClick: (paymentMethod: any) => void
}

export const PaymentMethodContainer: React.FC<PaymentMethodContainerProps> = ({
  selectedPaymentMethodId,
  order,
  templateSaveToWallet,
  onPaymentRef,
  onCardClick,
}) => {
  const paymentMethod = usePaymentMethodContext()
  const isPaymentMethodLoading = usePaymentMethodLoading()

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
      isLoading={isPaymentMethodLoading}
      onCardClick={handleCardClick}
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
