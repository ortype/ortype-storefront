'use client'

import type { BookRenderFont } from '@/components/book/book-page-content'
import { parseBookSnapshot } from '@/components/book/book-snapshot'
import getMetrics from '@/components/utils/metrics'
import { apiVersion } from '@/sanity/env'
import { bookSnapshotsQuery } from '@/sanity/lib/queries'
import type { BookSnapshotsQueryResult, ModuleBook } from '@/types'
import { Box, Button, Card, Dialog, Stack, Text } from '@sanity/ui'
import { useEffect, useMemo, useState } from 'react'
import {
  set,
  setIfMissing,
  unset,
  useClient,
  useFormValue,
  type ObjectInputProps,
} from 'sanity'
import BookSpreadThumbnail from './book-spread-thumbnail'
import styles from './book-snapshot-input.module.css'

type Snapshot = NonNullable<
  NonNullable<BookSnapshotsQueryResult['book']>['snapshots']
>[number]
type Config = NonNullable<ModuleBook['config']>
type Side = NonNullable<Config['display']>

function snapshotLabel(snapshot: Snapshot, index: number) {
  const date = snapshot.createdAt ? new Date(snapshot.createdAt) : null
  return date && Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : `Snapshot ${index + 1}`
}

// The thumbnail stays passive. Two sibling buttons provide page-level keyboard
// selection without embedding interactive controls inside Sanity preview media.
function SnapshotChoice({
  snapshot,
  label,
  font,
  defaultVariantId,
  value,
  readOnly,
  onSelect,
}: {
  snapshot: Snapshot
  label: string
  font: BookRenderFont | null
  defaultVariantId: string
  value?: Config
  readOnly?: boolean
  onSelect: (key: string, side: Side) => void
}) {
  const spread = useMemo(
    () => parseBookSnapshot(snapshot.spread),
    [snapshot.spread]
  )
  return (
    <div className={styles.choice}>
      <BookSpreadThumbnail
        spread={snapshot.spread}
        font={font}
        defaultVariantId={defaultVariantId}
      />
      <div className={styles.pages}>
        {(['verso', 'recto'] as const).map((side) => {
          const available = Boolean(snapshot._key && spread?.[side])
          const selected =
            value?.snapshotKey === snapshot._key &&
            (value.display ?? 'verso') === side
          return (
            <button
              key={side}
              type='button'
              className={styles.page}
              aria-label={`Select ${side} from ${label}`}
              aria-pressed={selected}
              disabled={readOnly || !available}
              onClick={() => onSelect(snapshot._key, side)}
            >
              <span className={styles.pageLabel}>
                {side === 'verso' ? 'Verso' : 'Recto'}
                {!available
                  ? ' · unavailable'
                  : selected
                    ? ' · Selected'
                    : ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// This input owns the config object so snapshot identity and source page can be
// patched together. The sibling book field remains a normal Sanity reference.
export default function BookSnapshotInput(props: ObjectInputProps<Config>) {
  const client = useClient({ apiVersion })
  const documentId = useFormValue(['_id'])
  const reference = useFormValue([...props.path.slice(0, -1), 'book', '_ref'])
  const fontId =
    typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : ''
  const bookId = typeof reference === 'string' ? reference : ''
  const source = JSON.stringify([fontId, bookId])
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    source: string
    data?: BookSnapshotsQueryResult
    error?: boolean
  } | null>(null)
  const [enlargedKey, setEnlargedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!bookId || !fontId) return
    let cancelled = false
    client
      .fetch(
        bookSnapshotsQuery,
        { bookId, fontId },
        { perspective: 'published', useCdn: false }
      )
      .then(
        (data) => {
          if (!cancelled) setResult({ source, data })
        },
        () => {
          if (!cancelled) setResult({ source, error: true })
        }
      )
    // A slow response for the previous book must not replace the current gallery.
    return () => {
      cancelled = true
    }
  }, [client, bookId, fontId, source, attempt])

  const data = result?.source === source ? result.data : undefined
  const error = result?.source === source && result.error
  const snapshots = data?.book?.snapshots ?? []
  const font = useMemo<BookRenderFont | null>(() => {
    if (!data?.font) return null
    return {
      shortName: data.font.shortName,
      metrics: getMetrics(data.font.metafields ?? []),
      variants: (data.font.variants ?? []).filter(
        (variant) => variant !== null
      ),
    }
  }, [data])
  const side = props.value?.display ?? 'verso'
  const selected = snapshots.find(
    (snapshot) => snapshot._key === props.value?.snapshotKey
  )
  const unavailable =
    props.value?.snapshotKey &&
    data &&
    (!selected || !parseBookSnapshot(selected.spread)?.[side])
  const enlargedIndex = snapshots.findIndex(
    (snapshot) => snapshot._key === enlargedKey
  )
  const enlarged = snapshots[enlargedIndex]
  const defaultVariantId =
    data?.book?.variantId ?? data?.font?.defaultVariant?._id ?? ''

  function select(snapshotKey: string, display: Side) {
    if (props.readOnly) return
    props.onChange([
      setIfMissing({}),
      set(snapshotKey, ['snapshotKey']),
      set(display, ['display']),
    ])
    setEnlargedKey(null)
  }

  return (
    <Stack gap={4}>
      {props.renderDefault(props)}
      {!bookId ? (
        <Text size={1} muted>
          Select a book to browse its snapshots.
        </Text>
      ) : (
        <>
          <Text size={1} muted>
            Choose a page to pin its snapshot. Source verso/recto is
            independent of this entry’s position in the specimen sequence.
          </Text>
          {unavailable && (
            <Card padding={3} tone='caution' radius={2}>
              <Text size={1}>
                The selected snapshot or page is unavailable in this book.
                Choose another page or clear the selection.
              </Text>
            </Card>
          )}
          {!data && !error && <Text size={1}>Loading snapshots…</Text>}
          {error && (
            <Text size={1}>Could not load snapshots. Please retry.</Text>
          )}
          {data && snapshots.length === 0 && (
            <Text size={1}>No snapshots are available for this book.</Text>
          )}
          <div className={styles.actions}>
            <Button
              text={error ? 'Retry' : 'Refresh snapshots'}
              mode='ghost'
              onClick={() => {
                setResult(null)
                setAttempt((value) => value + 1)
              }}
            />
            {props.value?.snapshotKey && !props.readOnly && (
              <Button
                text='Clear snapshot selection'
                mode='ghost'
                onClick={() => props.onChange(unset(['snapshotKey']))}
              />
            )}
          </div>
          <div className={styles.gallery}>
            {snapshots.map((snapshot, index) => (
              <Stack key={snapshot._key ?? index} gap={3}>
                <SnapshotChoice
                  snapshot={snapshot}
                  label={snapshotLabel(snapshot, index)}
                  font={font}
                  defaultVariantId={defaultVariantId}
                  value={props.value}
                  readOnly={props.readOnly}
                  onSelect={select}
                />
                <Text size={1} muted>
                  {snapshotLabel(snapshot, index)}
                </Text>
                <Button
                  text='Enlarge'
                  mode='ghost'
                  disabled={!snapshot._key}
                  onClick={() => setEnlargedKey(snapshot._key)}
                />
              </Stack>
            ))}
          </div>
          {enlarged && (
            <Dialog
              id={`${props.id}-snapshot-preview`}
              header={snapshotLabel(enlarged, enlargedIndex)}
              width={3}
              onClose={() => setEnlargedKey(null)}
              onClickOutside={() => setEnlargedKey(null)}
            >
              <Box padding={4}>
                <SnapshotChoice
                  snapshot={enlarged}
                  label={snapshotLabel(enlarged, enlargedIndex)}
                  font={font}
                  defaultVariantId={defaultVariantId}
                  value={props.value}
                  readOnly={props.readOnly}
                  onSelect={select}
                />
              </Box>
            </Dialog>
          )}
        </>
      )}
    </Stack>
  )
}
