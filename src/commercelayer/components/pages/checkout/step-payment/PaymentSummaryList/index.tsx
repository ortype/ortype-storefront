import { PaymentMethodPrice } from '@commercelayer/react-components'
import { useTranslation } from 'react-i18next'

import { PaymentMethodNameWithStripe } from '../PaymentMethodNameWithStripe'
import { Box, Radiomark } from '@chakra-ui/react'

export const PaymentSummaryList = ({ hasTitle }: { hasTitle: boolean }) => {
  const { t } = useTranslation()
  return (
    <>
      <Box>
        <Box data-testid="payment-method-item">
          <Box>
            <Radiomark className="form-radio" />
          </Box>
          {hasTitle && <PaymentMethodNameWithStripe />}
        </Box>
        {hasTitle && (
          <Box>
            <PaymentMethodPrice labelFree="&nbsp;" />
          </Box>
        )}
      </Box>
      <Box resource="payment_methods" />
    </>
  )
}
