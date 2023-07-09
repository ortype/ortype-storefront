import { OrderContainer } from '@commercelayer/react-components'
import CommerceLayer from '@commercelayer/react-components/auth/CommerceLayer'
import Cart from 'components/composite/Cart'
import { CartProvider, useCart } from 'components/data/CartProvider'
import { useCartSettingsOrInvalid } from 'components/hooks/useCartSettingsOrInvalid'

interface Props {
  settings: CheckoutSettings
  children: JSX.Element[] | JSX.Element
}

const CartContainer = ({ settings, children }: Props): JSX.Element => {
  const {
    settings: cartSettings,
    isLoading,
    retryOnError,
  } = useCartSettingsOrInvalid(settings)
  console.log(
    'useCartSettingsOrInvalid(settings): ',
    useCartSettingsOrInvalid(settings),
    cartSettings
  )

  console.log('isLoading: ', isLoading, cartSettings)
  if (isLoading || (!cartSettings && !retryOnError))
    return <>{'Cart: Loading... or no orderId'}</>

  if (!cartSettings) {
    if (retryOnError) {
      return <div>{'Retry error'}</div>
    }
    return <div>{'Retry error'}</div>
  }

  return (
    <CartProvider {...settings} {...cartSettings}>
      <OrderContainer>{children}</OrderContainer>
    </CartProvider>
  )
}

export default CartContainer
