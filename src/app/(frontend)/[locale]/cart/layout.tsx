import { CartProvider } from '@/commercelayer/providers/cart'
import { sanityFetch } from '@/sanity/lib/live'
import { fontUidsQuery } from '@/sanity/lib/queries'

/**
 * One CartProvider for every /cart route (cart page, the cart behind the buy
 * dialog, and the clone landing page), so cart edits and the clone import
 * share the same draft state.
 *
 * The cart lists its fonts in the site's font order (Sanity `orderRank`), not
 * the order Commerce Layer returns line items in.
 */
export default async function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // uids are identifiers, not editable content: no stega encoding
  const { data } = await sanityFetch({ query: fontUidsQuery, stega: false })
  const fontOrder = (data ?? [])
    .map((font) => font.uid)
    .filter((uid): uid is string => !!uid)

  return <CartProvider fontOrder={fontOrder}>{children}</CartProvider>
}
