'use client'
import dynamic from 'next/dynamic'

const DynamicCheckoutContainer: any = dynamic(
  () => import('src/commercelayer/components/composite/CheckoutContainer'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCheckout: any = dynamic(
  () => import('@/components/composite/Checkout'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Order = () => {
  return (
    <DynamicCheckoutContainer>
      <DynamicCheckout />
    </DynamicCheckoutContainer>
  )
}

export default Order
