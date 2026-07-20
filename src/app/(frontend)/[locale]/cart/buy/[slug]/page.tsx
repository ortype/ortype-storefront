import CartComponent from '@/commercelayer/components/pages/cart/'
import { CartProvider } from '@/commercelayer/providers/cart'

export default async function CartBuyChildrenSlot() {
  return (
    <CartProvider>
      <CartComponent />
    </CartProvider>
  )
}
