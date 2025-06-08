import { useIdentityContext } from '@/commercelayer/providers/Identity'
import {
  CommerceLayer,
  OrderContainer,
  OrderStorage,
} from '@commercelayer/react-components'

export default function CheckoutLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: {}
}) {
  const {
    clientConfig: { accessToken },
    config,
  } = useIdentityContext()

  return (
    <CommerceLayer accessToken={accessToken || ''} endpoint={config.endpoint}>
      <OrderStorage persistKey={`order`}>
        <OrderContainer>{children}</OrderContainer>
      </OrderStorage>
    </CommerceLayer>
  )
}
