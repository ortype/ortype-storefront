import type { Font } from '@/types'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { composeSpecimenSpreads, resolveSpecimenPages } from './specimen-data'

function spread(entry: string) {
  const page = [
    {
      colId: 'column-1',
      width: 100,
      blocks: [
        {
          blockId: 'block-1',
          fontSize: 100,
          lineCount: 1,
          entry,
        },
      ],
    },
  ]
  return JSON.stringify({ verso: page, recto: page })
}

const book = {
  _id: 'book-1',
  variantId: 'variant-1',
  snapshots: [
    {
      _key: 'first',
      _type: 'snapshot' as const,
      createdAt: '2026-11-19T09:00:00Z',
      spread: spread('First'),
    },
    {
      _key: 'second',
      _type: 'snapshot' as const,
      createdAt: '2026-11-20T09:00:00Z',
      spread: spread('Second'),
    },
  ],
}

const specimens = [
  {
    _key: 'left',
    _type: 'module.book',
    book,
    config: { snapshotKey: 'first', display: 'verso' },
  },
  {
    _key: 'right',
    _type: 'module.book',
    book,
    config: { snapshotKey: 'second', display: 'recto' },
  },
] satisfies Font['specimens']

test('one book can supply independently selected snapshots in the same spread', () => {
  const pages = resolveSpecimenPages(specimens)
  assert.equal(pages[0].content?.[0].blocks[0].entry, 'First')
  assert.equal(pages[1].content?.[0].blocks[0].entry, 'Second')
  assert.equal(composeSpecimenSpreads(pages).length, 1)
})

test('a missing selected snapshot retains its authored slot instead of shifting pages', () => {
  const pages = resolveSpecimenPages([
    { ...specimens[0], config: { snapshotKey: 'removed', display: 'verso' } },
    specimens[1],
  ])
  assert.equal(pages[0].content, null)
  const [composed] = composeSpecimenSpreads(pages)
  assert.equal(composed.pages[0].key, 'left')
  assert.equal(composed.pages[1].content?.[0].blocks[0].entry, 'Second')
})

test('clearing a snapshot key restores the first valid specimen snapshot', () => {
  const [page] = resolveSpecimenPages([
    { ...specimens[1], config: { display: 'recto' } },
  ])
  assert.equal(page.content?.[0].blocks[0].entry, 'First')
})
