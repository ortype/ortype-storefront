import { OrderContainer, OrderStorage } from '@commercelayer/react-components'
import { BuyProvider } from 'components/data/BuyProvider'

interface Props {
  font: object
  children: JSX.Element[] | JSX.Element
}

const BuyContainer = ({ font, children }: Props): JSX.Element => {
  return (
    <OrderStorage persistKey={`order`}>
      <OrderContainer>
        <BuyProvider font={font}>{children}</BuyProvider>
      </OrderContainer>
    </OrderStorage>
  )
}

export default BuyContainer
