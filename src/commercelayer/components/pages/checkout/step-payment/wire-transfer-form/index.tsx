import { WireTransferPayment } from '@/commercelayer/components/payment-sources'
import { useTranslation } from 'react-i18next'

interface WireTransferFormProps {}

export const WireTransferForm: React.FC<WireTransferFormProps> = () => {
  const { t } = useTranslation()

  return (
    <WireTransferPayment
      show={true}
      infoMessage={{
        text:
          t('stepPayment.wireTransferMessage', {
            defaultValue:
              'After placing the order, you will need to manually complete the payment with your bank',
          }) ||
          'After placing the order, you will need to manually complete the payment with your bank',
        className: 'text-sm text-blue-700',
      }}
    />
  )
}
