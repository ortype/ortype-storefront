/**
 * Run with: npx tsx --test src/commercelayer/providers/order/utils/derive-selections.test.ts
 * (uses node's built-in test runner; no extra dependencies)
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  allCartLineItemIds,
  applySelectionOverlay,
  deriveCommittedGroups,
  deriveGroupResolutionsFromOrder,
  deriveSelectionsFromOrder,
  groupSignature,
  isCommittedSizeStale,
  lineItemIdsForFont,
  mergeGroupResolutions,
  type DerivableOrder,
} from './derive-selections'
import type { StyleEntry } from '../types'

const SIZE = { label: 'Small', value: 'small', modifier: 1 }
const BIG = { label: 'Big', value: 'big', modifier: 2 }

const groupItem = (id: string, size = SIZE) => ({
  id,
  item_type: 'skus',
  sku_code: 'font-a--group--roman',
  reference_origin: 'font-a',
  metadata: {
    projectionType: 'group',
    parentUid: 'font-a',
    parentName: 'Font A',
    defaultVariantId: 'a-regular',
    groupName: 'Roman',
    groupSlug: 'roman',
    includedSkuCodes: ['a-regular', 'a-bold'],
    includedStyleNames: ['Font A Regular', 'Font A Bold'],
    license: {
      size,
      defaultTypes: ['desktop'],
      perStyleTypes: {
        'a-regular': ['desktop'],
        'a-bold': ['desktop', 'web'],
      },
    },
  },
})

const styleItem = (id: string, sku: string, uid = 'font-b', size = SIZE) => ({
  id,
  name: 'CL sku name',
  item_type: 'skus',
  sku_code: sku,
  reference_origin: uid,
  metadata: {
    projectionType: 'style',
    parentUid: uid,
    parentName: 'Font B',
    defaultVariantId: 'b-regular',
    styleName: `Font B ${sku}`,
    license: { size, types: ['web'] },
  },
})

const order: DerivableOrder = {
  line_items: [
    groupItem('li-g'),
    styleItem('li-s1', 'b-regular'),
    styleItem('li-s2', 'b-italic'),
    { id: 'li-ship', item_type: 'shipments', metadata: {} },
  ],
}

describe('deriveSelectionsFromOrder', () => {
  it('expands group projections into per-style entries', () => {
    const sel = deriveSelectionsFromOrder(order)
    assert.deepEqual(Object.keys(sel['font-a']), ['a-regular', 'a-bold'])
    assert.deepEqual(sel['font-a']['a-bold'], {
      licenseTypes: ['desktop', 'web'],
      parentName: 'Font A',
      name: 'Font A Bold',
      className: 'a-bold',
      defaultVariantId: 'a-regular',
    })
  })

  it('maps style projections using styleName and license.types', () => {
    const sel = deriveSelectionsFromOrder(order)
    assert.deepEqual(Object.keys(sel['font-b']), ['b-regular', 'b-italic'])
    assert.equal(sel['font-b']['b-italic'].name, 'Font B b-italic')
    assert.deepEqual(sel['font-b']['b-italic'].licenseTypes, ['web'])
  })

  it('ignores non-shoppable line items and handles empty orders', () => {
    assert.deepEqual(deriveSelectionsFromOrder(undefined), {})
    assert.deepEqual(deriveSelectionsFromOrder({ line_items: [] }), {})
  })

  it('falls back to the CL line item name for legacy style items', () => {
    const legacy = {
      line_items: [
        {
          id: 'x',
          name: 'Legacy',
          item_type: 'skus',
          sku_code: 'z',
          reference_origin: 'font-z',
          metadata: {},
        },
      ],
    }
    assert.equal(deriveSelectionsFromOrder(legacy)['font-z'].z.name, 'Legacy')
  })
})

describe('deriveCommittedGroups', () => {
  it('collects line item ids, signature and size per font', () => {
    const committed = deriveCommittedGroups(order)
    assert.deepEqual(committed['font-a'].lineItemIds, ['li-g'])
    assert.deepEqual(committed['font-b'].lineItemIds, ['li-s1', 'li-s2'])
    assert.deepEqual(committed['font-b'].size, SIZE)
    assert.equal(
      committed['font-a'].signature,
      groupSignature(deriveSelectionsFromOrder(order)['font-a'])
    )
  })

  it('reports an undefined size when a font line items disagree', () => {
    const mixed: DerivableOrder = {
      line_items: [
        styleItem('1', 'b-regular', 'font-b', SIZE),
        styleItem('2', 'b-italic', 'font-b', BIG),
      ],
    }
    assert.equal(deriveCommittedGroups(mixed)['font-b'].size, undefined)
  })
})

describe('lineItemIdsForFont / allCartLineItemIds', () => {
  it('returns only that font line items; all excludes non-cart items', () => {
    assert.deepEqual(lineItemIdsForFont(order, 'font-b'), ['li-s1', 'li-s2'])
    assert.deepEqual(lineItemIdsForFont(order, 'nope'), [])
    assert.deepEqual(allCartLineItemIds(order), ['li-g', 'li-s1', 'li-s2'])
  })
})

describe('deriveGroupResolutionsFromOrder', () => {
  it('rebuilds resolved groups from group projections only', () => {
    const res = deriveGroupResolutionsFromOrder(order)
    assert.deepEqual(res['font-a'], [
      {
        groupName: 'Roman',
        groupSlug: 'roman',
        groupSkuCode: 'font-a--group--roman',
        includedSkuCodes: ['a-regular', 'a-bold'],
      },
    ])
    assert.equal(res['font-b'], undefined)
  })

  it('merge lets later sources win per font', () => {
    const merged = mergeGroupResolutions(
      deriveGroupResolutionsFromOrder(order),
      { 'font-a': [] },
      {
        'font-a': [
          {
            groupName: 'Cached',
            groupSlug: 'cached',
            groupSkuCode: 'c',
            includedSkuCodes: ['a-regular'],
          },
        ],
      }
    )
    assert.equal(merged['font-a'][0].groupName, 'Cached')
  })
})

describe('groupSignature', () => {
  const entry = (types: string[], extra: Partial<StyleEntry> = {}) => ({
    licenseTypes: types,
    parentName: 'P',
    name: 'N',
    className: 'c',
    defaultVariantId: 'd',
    ...extra,
  })

  it('ignores display fields, key order and license type order', () => {
    const a = { x: entry(['web', 'desktop']), y: entry(['web']) }
    const b = {
      y: entry(['web'], { name: 'Different', className: '' }),
      x: entry(['desktop', 'web']),
    }
    assert.equal(groupSignature(a), groupSignature(b))
  })

  it('changes when styles or license types change', () => {
    const base = { x: entry(['web']) }
    assert.notEqual(
      groupSignature(base),
      groupSignature({ x: entry(['pdf']) })
    )
    assert.notEqual(
      groupSignature(base),
      groupSignature({ ...base, y: entry(['web']) })
    )
  })

  it('a draft built like the buy dialog equals the derived entry', () => {
    const derived = deriveSelectionsFromOrder(order)['font-a']
    const draft = {
      'a-regular': entry(['desktop']),
      'a-bold': entry(['web', 'desktop']),
    }
    assert.equal(groupSignature(derived), groupSignature(draft))
  })
})

describe('applySelectionOverlay', () => {
  it('replaces a font and removes it when the overlay group is empty', () => {
    const base = deriveSelectionsFromOrder(order)
    const replaced = applySelectionOverlay(base, {
      'font-b': { 'b-regular': base['font-b']['b-regular'] },
    })
    assert.deepEqual(Object.keys(replaced['font-b']), ['b-regular'])
    const removed = applySelectionOverlay(base, { 'font-a': {} })
    assert.equal(removed['font-a'], undefined)
    assert.ok(removed['font-b'])
  })
})

describe('isCommittedSizeStale', () => {
  it('compares size value and modifier; missing size is stale', () => {
    assert.equal(isCommittedSizeStale(SIZE, SIZE), false)
    assert.equal(isCommittedSizeStale(SIZE, BIG), true)
    assert.equal(isCommittedSizeStale(undefined, SIZE), true)
  })
})
