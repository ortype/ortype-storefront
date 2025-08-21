'use client'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import dynamic from 'next/dynamic'

const DynamicCheckoutContainer: any = dynamic(
  () => import('@/commercelayer/components/pages/checkout/container'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)
const DynamicCheckout: any = dynamic(
  () => import('@/commercelayer/components/pages/checkout/checkout'),
  {
    loading: function LoadingSkeleton() {
      return <div />
    },
  }
)

const Order = () => {
  const {
    clientConfig: { accessToken },
    config,
  } = useIdentityContext()

  return (
    <DynamicCheckoutContainer>
      <DynamicCheckout />
    </DynamicCheckoutContainer>
  )
}

export default Order
