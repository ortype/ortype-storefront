import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseBookSnapshot, resolveBookSnapshot } from './book-snapshot'

const page = [
  {
    colId: 'column-1',
    width: 100,
    blocks: [
      {
        blockId: 'block-1',
        variantId: null,
        fontSize: 173,
        lineHeight: null,
        lineGap: null,
        marginBottom: -47,
        lineCount: 1,
        entry: '<span>VESPA</span>',
      },
    ],
  },
]

test('normalizes legacy nulls while retaining authored typography and text', () => {
  const spread = parseBookSnapshot(
    JSON.stringify({ verso: page, recto: page })
  )
  assert.ok(spread?.verso)
  const block = spread.verso[0].blocks[0]
  assert.equal(block.variantId, undefined)
  assert.equal(block.lineHeight, 1)
  assert.equal(block.lineGap, 0)
  assert.equal(block.marginBottom, -47)
  assert.equal(block.entry, '<span>VESPA</span>')
  assert.deepEqual(spread.recto, spread.verso)
})

test('accepts a missing source page and empty spacer columns', () => {
  const spread = parseBookSnapshot(
    JSON.stringify({
      verso: [{ colId: 'spacer', width: 50, blocks: [] }],
      recto: null,
    })
  )
  assert.ok(spread?.verso)
  assert.equal(spread.recto, null)
  assert.deepEqual(spread.verso[0].blocks, [])
})

test('rejects malformed JSON and invalid geometry without throwing', () => {
  for (const value of [undefined, null, '', '{', 'null', '[]']) {
    assert.equal(parseBookSnapshot(value), null)
  }
  for (const width of [0, -50, 101]) {
    assert.equal(
      parseBookSnapshot(JSON.stringify({ verso: [{ ...page[0], width }] })),
      null
    )
  }
  assert.equal(
    parseBookSnapshot(
      JSON.stringify({
        verso: [
          {
            ...page[0],
            blocks: [{ ...page[0].blocks[0], fontSize: 0 }],
          },
        ],
      })
    ),
    null
  )
})

const snapshots = [
  {
    _key: 'first',
    _type: 'snapshot' as const,
    spread: JSON.stringify({ verso: page }),
  },
  {
    _key: 'second',
    _type: 'snapshot' as const,
    spread: JSON.stringify({ recto: page }),
  },
]

test('resolves the selected key even after snapshot reordering', () => {
  const expected = parseBookSnapshot(snapshots[1].spread)
  assert.deepEqual(resolveBookSnapshot(snapshots, 'second'), expected)
  assert.deepEqual(
    resolveBookSnapshot([...snapshots].reverse(), 'second'),
    expected
  )
})

test('never substitutes another snapshot for a missing or invalid selection', () => {
  assert.equal(resolveBookSnapshot(snapshots, 'deleted'), null)
  assert.equal(resolveBookSnapshot(snapshots, 'deleted', 'random'), null)
  assert.equal(
    resolveBookSnapshot(
      [{ ...snapshots[0], spread: '{' }, snapshots[1]],
      'first'
    ),
    null
  )
})

test('keeps the existing fallback behavior when no snapshot is pinned', () => {
  const first = parseBookSnapshot(snapshots[0].spread)
  assert.deepEqual(resolveBookSnapshot(snapshots), first)
  assert.deepEqual(
    resolveBookSnapshot([{ ...snapshots[1], spread: '{' }, snapshots[0]]),
    first
  )
  assert.deepEqual(resolveBookSnapshot([snapshots[0]], null, 'random'), first)
  assert.equal(resolveBookSnapshot(undefined), null)
  assert.equal(resolveBookSnapshot([], undefined, 'random'), null)
})
