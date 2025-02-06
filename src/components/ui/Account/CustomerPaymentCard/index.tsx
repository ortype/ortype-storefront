import { CustomerPaymentSource } from '@commercelayer/react-components/customers/CustomerPaymentSource'

import { PaymentSourceCard } from '@/components/ui/Account/PaymentSource/Card'
import { Grid } from '@chakra-ui/react'

function CustomerPaymentCard(): JSX.Element {
  return (
    <CustomerPaymentSource loader={<div />}>
      <Grid>
        <PaymentSourceCard />
      </Grid>
    </CustomerPaymentSource>
  )
}

export default CustomerPaymentCard
