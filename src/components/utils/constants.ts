import type { TypeAccepted } from '@/commercelayer/providers/checkout/utils'

export const LINE_ITEMS_SHIPPABLE: TypeAccepted[] = ['skus', 'bundles']
export const LINE_ITEMS_SHOPPABLE: TypeAccepted[] = [
  ...LINE_ITEMS_SHIPPABLE,
  'gift_cards',
]
