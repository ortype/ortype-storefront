'use client'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { CommerceLayer, OrderStorage } from '@commercelayer/react-components'
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
    <CommerceLayer accessToken={accessToken || ''} endpoint={config.endpoint}>
      <OrderStorage persistKey={`order`}>
        <DynamicCheckoutContainer>
          <DynamicCheckout />
        </DynamicCheckoutContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}

export default Order
