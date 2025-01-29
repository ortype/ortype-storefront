import { SkeletonMainPageTitle } from '@/components/composite/Account/Skeleton/Main/Common'
import { SkeletonMainOrdersTable } from '@/components/composite/Account/Skeleton/Main/OrdersTable'
import { SkeletonWrapper } from '@/components/composite/Account/Skeleton/styled'

interface Props {
  visible?: boolean
}

export function SkeletonMainOrders({ visible = true }: Props) {
  return (
    <SkeletonWrapper visible={visible}>
      <SkeletonMainPageTitle />
      <SkeletonMainOrdersTable />
    </SkeletonWrapper>
  )
}
