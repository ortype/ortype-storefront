import OrderPage from 'components/composite/OrderPage'
import dynamic from 'next/dynamic'

const DynamicOrderPage: any = dynamic(
  () => import('components/composite/OrderPage'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export default function Order({ params }: { params: { orderId: string } }) {
  return <DynamicOrderPage orderId={params.orderId} />
}
