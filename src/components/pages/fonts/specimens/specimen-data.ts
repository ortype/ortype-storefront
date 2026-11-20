import {
  resolveBookSnapshot,
  type BookPage,
} from '@/components/book/book-snapshot'
import type { Font } from '@/types'

export type SpecimenPageContent = BookPage

export function resolveSpecimenPages(specimens: Font['specimens']) {
  // Unpinned uses of one book share the deterministic first valid snapshot.
  // Pinned uses may deliberately choose different snapshots from that same book.
  const snapshots = new Map<string, ReturnType<typeof resolveBookSnapshot>>()
  return (specimens ?? []).map((specimen) => {
    const book = specimen.book
    const bookId = book?._id ?? specimen._key
    const snapshotKey = specimen.config?.snapshotKey
    const cacheKey = JSON.stringify([bookId, snapshotKey ?? null])
    if (!snapshots.has(cacheKey)) {
      snapshots.set(
        cacheKey,
        resolveBookSnapshot(book?.snapshots, snapshotKey)
      )
    }
    // Each CMS entry chooses a source page; it does not supply an entire spread.
    // Keep missing pages as null slots so later authored pairings never shift.
    const side = specimen.config?.display === 'recto' ? 'recto' : 'verso'
    const content = snapshots.get(cacheKey)?.[side] ?? null
    return {
      key: specimen._key,
      content,
      variantId: book?.variantId ?? '',
    }
  })
}

export type SpecimenPage = ReturnType<typeof resolveSpecimenPages>[number]

export function composeSpecimenSpreads(pages: SpecimenPage[]) {
  // Pair authored entries, not the verso/recto fields of one referenced book.
  // Studio requires an even count; floor also protects against incomplete drafts.
  return Array.from({ length: Math.floor(pages.length / 2) }, (_, index) => {
    const left = pages[index * 2]
    const right = pages[index * 2 + 1]
    return { key: `${left.key}-${right.key}`, pages: [left, right] }
  })
}

// Shared by the section and its navigation link: neither should show empty data.
export const hasSpecimenContent = (pages: SpecimenPage[]) =>
  pages.some((page) =>
    page.content?.some((column) =>
      column.blocks.some((block) => block.entry?.trim())
    )
  )
