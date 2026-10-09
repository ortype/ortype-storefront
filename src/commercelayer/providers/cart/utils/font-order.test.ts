/**
 * Run with: npx tsx --test src/commercelayer/providers/cart/utils/font-order.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sortByFontOrder } from './font-order'

const g = (parentUid: string) => ({ parentUid })
const uids = (groups: { parentUid: string }[]) =>
  groups.map((x) => x.parentUid)

describe('sortByFontOrder', () => {
  it('sorts by the font order, regardless of input order', () => {
    const sorted = sortByFontOrder([g('c'), g('a'), g('b')], ['a', 'b', 'c'])
    assert.deepEqual(uids(sorted), ['a', 'b', 'c'])
  })

  it('puts unknown fonts last, keeping their relative order', () => {
    const sorted = sortByFontOrder(
      [g('x'), g('b'), g('y'), g('a')],
      ['a', 'b']
    )
    assert.deepEqual(uids(sorted), ['a', 'b', 'x', 'y'])
  })

  it('is a no-op without a font order (returns the same array)', () => {
    const groups = [g('b'), g('a')]
    assert.equal(sortByFontOrder(groups, []), groups)
  })

  it('does not mutate its input', () => {
    const groups = [g('b'), g('a')]
    sortByFontOrder(groups, ['a', 'b'])
    assert.deepEqual(uids(groups), ['b', 'a'])
  })
})
