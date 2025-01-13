import { BuyProvider } from '@/commercelayer/providers/Buy'
import { useOrderContext } from '@/commercelayer/providers/Order'
import { OrderContainer } from '@commercelayer/react-components'

interface Props {
  font: object
  children: JSX.Element[] | JSX.Element
}

const BuyContainer = ({ font, children }: Props): JSX.Element => {
  // const { isLoading, isInvalid } = useOrderContext()
  return (
    <OrderContainer>
      <BuyProvider font={font}>{children}</BuyProvider>
    </OrderContainer>
  )
}

export default BuyContainer
