'use client'

import type { BookRenderFont } from '@/components/book/book-page-content'
import getMetrics from '@/components/utils/metrics'
import { apiVersion } from '@/sanity/env'
import { bookReferenceOptionsQuery } from '@/sanity/lib/queries'
import type { BookReferenceOptionsQueryResult } from '@/types'
import {
  Box,
  Button,
  Card,
  Dialog,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import { useEffect, useMemo, useState } from 'react'
import {
  set,
  useClient,
  useFormValue,
  type ReferenceInputProps,
} from 'sanity'
import styles from './book-reference-input.module.css'
import BookSpreadThumbnail from './book-spread-thumbnail'

// Decorate rather than replace Sanity's native input: search, clear, reference
// status, keyboard focus, and collaborative patches retain their built-in UI.
export default function BookReferenceInput(props: ReferenceInputProps) {
  const client = useClient({ apiVersion })
  const documentId = useFormValue(['_id'])
  const fontId =
    typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : ''
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    fontId: string
    data?: BookReferenceOptionsQueryResult
    error?: boolean
  } | null>(null)
  const selectedId = props.value?._ref
  const enabled = Boolean(fontId && (open || selectedId))

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    // Match the existing reference filter and use published book IDs. The
    // gallery chooses a book, not a particular snapshot or page of that book.
    client
      .fetch(
        bookReferenceOptionsQuery,
        { fontId },
        { perspective: 'published', useCdn: false }
      )
      .then(
        (data) => {
          if (!cancelled) setResult({ fontId, data })
        },
        () => {
          if (!cancelled) setResult({ fontId, error: true })
        }
      )

    // Changing documents or closing an unused picker must not apply stale data.
    return () => {
      cancelled = true
    }
  }, [client, enabled, fontId, attempt, open])

  const data = result?.fontId === fontId ? result.data : undefined
  const error = result?.fontId === fontId && result.error
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
  const selected = data?.books.find((book) => book._id === selectedId)
  const books = data?.books.filter((book) =>
    (book.name ?? '').toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      {selected && (
        <div className={styles.selected}>
          <BookSpreadThumbnail
            spread={selected.snapshot?.spread}
            font={font}
            defaultVariantId={
              selected.variantId ?? data?.font?.defaultVariant?._id ?? ''
            }
          />
          <Text size={1} muted>
            First snapshot · layout preview
          </Text>
        </div>
      )}
      {enabled && !data && !error && (
        <Text size={1} muted>
          Loading layout previews…
        </Text>
      )}
      {error && (
        <Card padding={3} tone='caution' radius={2}>
          <Stack gap={3}>
            <Text size={1}>Could not load layout previews.</Text>
            <Button
              text='Retry'
              mode='ghost'
              onClick={() => {
                setResult(null)
                setAttempt((value) => value + 1)
              }}
            />
          </Stack>
        </Card>
      )}
      {!props.readOnly && (
        <Button
          text='Browse layouts'
          mode='ghost'
          disabled={!fontId}
          onClick={() => setOpen(true)}
        />
      )}
      {open && (
        <Dialog
          id={`${props.id}-book-layouts`}
          header='Choose a book layout'
          width={3}
          onClose={() => setOpen(false)}
          onClickOutside={() => setOpen(false)}
        >
          <Box padding={4}>
            <Stack gap={4}>
              <TextInput
                aria-label='Filter book layouts'
                placeholder='Filter layouts by name'
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
              {!data && !error && <Spinner />}
              {error && (
                <Stack gap={3}>
                  <Text size={1}>Could not load layout previews.</Text>
                  <Button
                    text='Retry'
                    mode='ghost'
                    onClick={() => {
                      setResult(null)
                      setAttempt((value) => value + 1)
                    }}
                  />
                </Stack>
              )}
              {data && books?.length === 0 && (
                <Text size={1} muted>
                  {data.books.length
                    ? 'No layouts match your search.'
                    : 'No books are available for this font.'}
                </Text>
              )}
              <div className={styles.grid}>
                {books?.map((book) => (
                  <button
                    key={book._id}
                    type='button'
                    className={styles.option}
                    aria-pressed={book._id === selectedId}
                    disabled={props.readOnly}
                    onClick={() => {
                      if (props.readOnly) return
                      // Keep a genuine weak Sanity reference; never duplicate
                      // snapshot JSON into the parent font's module data.
                      props.onChange(
                        set({
                          _type: 'reference',
                          _ref: book._id,
                          _weak: true,
                        })
                      )
                      setOpen(false)
                    }}
                  >
                    <BookSpreadThumbnail
                      spread={book.snapshot?.spread}
                      font={font}
                      defaultVariantId={
                        book.variantId ??
                        data?.font?.defaultVariant?._id ??
                        ''
                      }
                    />
                    <span className={styles.caption}>
                      {book.name || 'Untitled book'}
                      {book._id === selectedId && ' · Selected'}
                    </span>
                  </button>
                ))}
              </div>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Stack>
  )
}
