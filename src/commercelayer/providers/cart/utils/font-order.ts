/**
 * Keep the cart's fonts in a stable, editorial order.
 *
 * The cart's font order would otherwise follow the order Commerce Layer
 * returns line items in, and saving a font (`commitGroup`) deletes and
 * recreates its line items, which moves it to the end. Sorting by the site's
 * font order (Sanity `orderRank`, the same order as the font grid) makes the
 * cart independent of when line items were created.
 *
 * Fonts missing from `fontOrder` (e.g. a font that was deleted from Sanity)
 * go last and keep their relative order (the sort is stable).
 */
export function sortByFontOrder<T extends { parentUid: string }>(
  groups: T[],
  fontOrder: readonly string[]
): T[] {
  if (fontOrder.length === 0 || groups.length < 2) return groups

  const rank = new Map(fontOrder.map((uid, index) => [uid, index]))
  return [...groups].sort((a, b) => {
    const ra = rank.get(a.parentUid) ?? Infinity
    const rb = rank.get(b.parentUid) ?? Infinity
    return ra === rb ? 0 : ra < rb ? -1 : 1
  })
}
