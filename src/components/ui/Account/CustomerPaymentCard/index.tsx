import { CustomerPaymentSource } from '@commercelayer/react-components/customers/CustomerPaymentSource'

import { SkeletonMainWalletCard } from '@/components/composite/Account/Skeleton/Main/Common'
import { GridCard } from '@/components/ui/Account/GridCard'
import { PaymentSourceCard } from '@/components/ui/Account/PaymentSource/Card'

function CustomerPaymentCard(): JSX.Element {
  return (
    <CustomerPaymentSource loader={<SkeletonMainWalletCard noGap />}>
      <GridCard hover="none">
        <PaymentSourceCard />
      </GridCard>
    </CustomerPaymentSource>
  )
}

export default CustomerPaymentCard
