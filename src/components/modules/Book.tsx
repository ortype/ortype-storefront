import RectoVerso from '@/components/pages/book/RectoVerso'
import { resolveBookSnapshot } from '@/components/book/book-snapshot'
import type { FontModule } from '@/components/pages/fonts/font-sections'

export interface BookModuleProps {
  value: Extract<FontModule, { _type: 'book' | 'module.book' }>
}

export default function BookModule({ value }: BookModuleProps) {
  const { config } = value
  // Conditional GROQ projections can retain the reference shape in generated
  // unions. An unresolved weak reference has no artwork and must not be parsed.
  const book = value.book && 'snapshots' in value.book ? value.book : null
  // Keep legacy random selection only for unpinned modules. Explicit selections
  // use the same safe decoder and stable snapshot keys as the specimen section.
  const spread = resolveBookSnapshot(
    book?.snapshots,
    config?.snapshotKey,
    'random'
  )
  const side = config?.display === 'recto' ? 'recto' : 'verso'
  const page = spread?.[side]

  return (
    book &&
    page && (
      <RectoVerso
        label={side}
        page={page}
        defaultVariantId={book.variantId ?? ''}
      />
    )
  )
}
