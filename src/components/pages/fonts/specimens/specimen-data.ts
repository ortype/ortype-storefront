import type { BlockParams } from '@/components/composite/Book/bookTypes'
import type { Font } from '@/types'
import { z } from 'zod'

type Specimen = NonNullable<Font['specimens']>[number]

// Snapshot JSON is the one untyped boundary; CMS fields use query-generated types.
const blockSchema: z.ZodType<BlockParams, z.ZodTypeDef, unknown> = z.object({
  blockId: z.string(),
  // GraphQL exports explicit nulls, not just missing properties. A null variant
  // means "use the book's default"; line height is derived from font metrics.
  variantId: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  fontSize: z.number().finite().positive(),
  lineHeight: z
    .number()
    .finite()
    .nullish()
    .transform((value) => value ?? 1),
  lineGap: z
    .number()
    .finite()
    .nullish()
    .transform((value) => value ?? 0),
  marginBottom: z.number().finite().default(0),
  wordCount: z.number().int().nonnegative().default(0),
  lineCount: z.number().int().positive(),
  regex: z.string().default(''),
  noSpace: z.boolean().default(false),
  isParagraph: z.boolean().default(false),
  entry: z.string(),
})

const pageSchema = z
  .array(
    z.object({
      colId: z.string(),
      width: z.number().finite().positive().max(100),
      blocks: z.array(blockSchema),
    })
  )
  .min(1)

const spreadSchema = z.object({
  verso: pageSchema.nullish(),
  recto: pageSchema.nullish(),
})

export type SpecimenPageContent = z.infer<typeof pageSchema>

function decodeSnapshot(book: Specimen['book']) {
  // First valid snapshot in stored order: deterministic on server and client.
  // Unlike legacy BookModule, a render or layout change must not reroll the text.
  for (const snapshot of book?.snapshots ?? []) {
    if (!snapshot.spread) continue
    try {
      const result = spreadSchema.safeParse(JSON.parse(snapshot.spread))
      if (result.success) return result.data
    } catch {
      // A malformed snapshot must not break the font page.
    }
  }
  return null
}

export function resolveSpecimenPages(specimens: Font['specimens']) {
  // A book reused for left/right selections must resolve to the same snapshot.
  const snapshots = new Map<string, ReturnType<typeof decodeSnapshot>>()
  return (specimens ?? []).map((specimen) => {
    const book = specimen.book
    const bookId = book?._id ?? specimen._key
    if (!snapshots.has(bookId)) {
      snapshots.set(bookId, decodeSnapshot(book))
    }
    // Each CMS entry chooses a source page; it does not supply an entire spread.
    // Keep missing pages as null slots so later authored pairings never shift.
    const side = specimen.config?.display === 'recto' ? 'recto' : 'verso'
    const content = snapshots.get(bookId)?.[side] ?? null
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
