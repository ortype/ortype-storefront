import { NextPage } from 'next'
import CartComponent from '@/commercelayer/components/pages/cart/'
import { CartProvider } from '@/commercelayer/providers/cart'

const Cart: NextPage = async () => {
  return (
    <CartProvider>
      <CartComponent />
    </CartProvider>
  )
}

export default Cart
