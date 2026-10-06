import { CartProvider } from '@/commercelayer/providers/cart'

/**
 * One CartProvider for every /cart route (cart page, the cart behind the buy
 * dialog, and the clone landing page), so cart edits and the clone import
 * share the same optimistic state.
 */
export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}
