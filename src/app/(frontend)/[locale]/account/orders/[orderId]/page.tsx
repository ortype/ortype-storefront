// import OrderPage from '@/commercelayer/components/pages/account/order'
import dynamic from 'next/dynamic'

const DynamicOrderPage: any = dynamic(
  () => import('@/commercelayer/components/pages/account/order'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

export default function Order({ params }: { params: { orderId: string } }) {
  return <DynamicOrderPage orderId={params.orderId} />
}
