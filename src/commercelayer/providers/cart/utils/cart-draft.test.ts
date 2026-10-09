/**
 * Run with: npx tsx --test src/commercelayer/providers/cart/utils/cart-draft.test.ts
 * (uses node's built-in test runner; no extra dependencies)
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { SelectionBuffer, StyleEntry } from '../../order/types'
import {
  dirtyFonts,
  isFontDirty,
  normalizeDraft,
  pickStyles,
  removeStylesFromGroup,
  restoreStyles,
} from './cart-draft'

const entry = (name: string, types: string[] = ['desktop']): StyleEntry => ({
  licenseTypes: types,
  parentName: 'Font',
  name,
  className: name,
  defaultVariantId: 'regular',
})

const order: SelectionBuffer = {
  'font-a': { 'a-1': entry('a-1'), 'a-2': entry('a-2') },
  'font-b': { 'b-1': entry('b-1') },
}

describe('isFontDirty', () => {
  it('is clean when the draft matches the order (display fields ignored)', () => {
    const draft = { 'a-2': entry('renamed'), 'a-1': entry('a-1') }
    assert.equal(isFontDirty(order['font-a'], draft), false)
  })

  it('is dirty when a style is removed or license types change', () => {
    assert.equal(isFontDirty(order['font-a'], { 'a-1': entry('a-1') }), true)
    assert.equal(
      isFontDirty(order['font-b'], { 'b-1': entry('b-1', ['web']) }),
      true
    )
  })

  it('treats an empty draft as a pending removal only if the font is on the order', () => {
    assert.equal(isFontDirty(order['font-a'], {}), true)
    assert.equal(isFontDirty(undefined, {}), false)
  })

  it('is dirty for a draft font that is not on the order', () => {
    assert.equal(isFontDirty(undefined, { 'c-1': entry('c-1') }), true)
  })
})

describe('normalizeDraft / dirtyFonts', () => {
  it('drops entries equal to the order and keeps real edits', () => {
    const draft: SelectionBuffer = {
      'font-a': { 'a-1': entry('a-1'), 'a-2': entry('a-2') }, // clean
      'font-b': {}, // removal
    }
    assert.deepEqual(Object.keys(normalizeDraft(order, draft)), ['font-b'])
    assert.deepEqual(dirtyFonts(order, draft), ['font-b'])
  })

  it('returns the same object when nothing is dropped', () => {
    const draft: SelectionBuffer = { 'font-b': {} }
    assert.equal(normalizeDraft(order, draft), draft)
  })

  it('does not mutate its input', () => {
    const draft: SelectionBuffer = { 'font-a': order['font-a'] }
    normalizeDraft(order, draft)
    assert.deepEqual(Object.keys(draft), ['font-a'])
  })
})

describe('removeStylesFromGroup / pickStyles / restoreStyles', () => {
  it('removes only the given styles', () => {
    const next = removeStylesFromGroup(order['font-a'], ['a-1'])
    assert.deepEqual(Object.keys(next), ['a-2'])
    assert.deepEqual(Object.keys(order['font-a']), ['a-1', 'a-2'])
  })

  it('picks only styles that are present', () => {
    const picked = pickStyles(order['font-a'], ['a-1', 'nope'])
    assert.deepEqual(Object.keys(picked), ['a-1'])
  })

  it('undo merges the removed styles back and keeps later edits', () => {
    const removed = pickStyles(order['font-a'], ['a-1'])
    // user removed a-1, then changed a-2's license types
    const current = { 'a-2': entry('a-2', ['web']) }
    const restored = restoreStyles(current, removed)
    assert.deepEqual(Object.keys(restored).sort(), ['a-1', 'a-2'])
    assert.deepEqual(restored['a-2'].licenseTypes, ['web'])
  })

  it('undoing a removal returns the font to clean', () => {
    const removed = pickStyles(order['font-a'], ['a-1'])
    const afterRemove = removeStylesFromGroup(order['font-a'], ['a-1'])
    assert.equal(isFontDirty(order['font-a'], afterRemove), true)
    const afterUndo = restoreStyles(afterRemove, removed)
    assert.equal(isFontDirty(order['font-a'], afterUndo), false)
  })

  it('undoing a whole font removal (empty group) returns it to clean', () => {
    const removed = pickStyles(order['font-b'], ['b-1'])
    const restored = restoreStyles({}, removed)
    assert.equal(isFontDirty(order['font-b'], restored), false)
  })
})
