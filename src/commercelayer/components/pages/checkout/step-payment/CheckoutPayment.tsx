import { PaymentMethod, PaymentSource } from '@/commercelayer/components'

import { PaymentDetails } from './PaymentDetails'
import { PaymentSummaryList } from './PaymentSummaryList'

import { Box, Container } from '@chakra-ui/react'
import { THandleClick } from '.'

interface Props {
  selectPayment: THandleClick
  hasTitle: boolean
  autoSelectCallback: () => void
}

export const CheckoutPayment = ({
  selectPayment,
  hasTitle,
  autoSelectCallback,
}: Props): JSX.Element => {
  return (
    <PaymentMethod
      autoSelectSinglePaymentMethod={autoSelectCallback}
      activeClass="active"
      className="payment group"
      loader={<div />}
      clickableContainer
      hide={['external_payments']}
      // @ts-expect-error Type Types of parameters 'params' and 'payment' are incompatible.
      onClick={selectPayment}
    >
      <Box data-testid="payment-sources-container">
        <PaymentSummaryList hasTitle={hasTitle} />
        <Container data-testid="payment-source">
          <PaymentSource className="flex flex-col" loader={<div />}>
            <Box>
              <PaymentDetails hasEditButton />
            </Box>
          </PaymentSource>
        </Container>
      </Box>
    </PaymentMethod>
  )
}
