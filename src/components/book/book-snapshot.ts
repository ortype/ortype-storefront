import type { BlockParams } from '@/components/composite/Book/bookTypes'
import type { Book } from '@/types'
import { z } from 'zod'

// Snapshot JSON is the untyped boundary. Both Studio and the frontend normalize
// legacy explicit nulls here rather than disagreeing about what can be rendered.
const blockSchema: z.ZodType<BlockParams, z.ZodTypeDef, unknown> = z.object({
  blockId: z.string(),
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

export type BookPage = z.infer<typeof pageSchema>

export function parseBookSnapshot(value?: string | null) {
  if (!value) return null
  try {
    const result = spreadSchema.safeParse(JSON.parse(value))
    return result.success ? result.data : null
  } catch {
    // An invalid historical snapshot should produce a placeholder, not crash Studio.
    return null
  }
}

export function resolveBookSnapshot(
  snapshots: Book['snapshots'] | null,
  snapshotKey?: string | null,
  fallback: 'first' | 'random' = 'first'
) {
  if (snapshotKey) {
    // An explicit choice must never silently become another snapshot when the
    // book changes, the snapshot is removed, or its JSON becomes invalid.
    return parseBookSnapshot(
      snapshots?.find((snapshot) => snapshot._key === snapshotKey)?.spread
    )
  }
  if (fallback === 'random') {
    return parseBookSnapshot(
      snapshots?.[Math.floor(Math.random() * snapshots.length)]?.spread
    )
  }
  for (const snapshot of snapshots ?? []) {
    const spread = parseBookSnapshot(snapshot.spread)
    if (spread) return spread
  }
  return null
}
