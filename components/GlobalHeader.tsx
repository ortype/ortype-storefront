// Wrap Header in an "Order" container ?
// The hosted cart just loads an order thats its logical extent
// We have custom handlers for updating lineItem licenses that we need access to
// We also want to use the Customer context in the header for Account
import { OrderContainer } from '@commercelayer/react-components'
import { Cart } from 'components/composite/Cart'
import { CartProvider, useCart } from 'components/data/CartProvider'
import { Settings } from 'CustomApp'

interface Props {
  settings: object
}

export const GlobalHeader: React.FC<Props> = ({ settings }) => {
  return (
    <>
      {'Or Type'}
      <CartProvider {...settings}>
        <OrderContainer>
          <Cart />
        </OrderContainer>
      </CartProvider>
    </>
  )
}
