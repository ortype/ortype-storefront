import {
  type CommerceLayerClient,
  type LineItem,
  type LineItemOptionCreate,
  type LineItemUpdate,
  type Order,
  type OrderUpdate,
  type SkuOption,
} from '@commercelayer/sdk'
import { sizes } from '@/lib/settings'
import { AddLineItemLicenseTypes } from './types'

// @NOTE: move these utils to @/commmercelayer/utils in named files (??)
// like buy.ts, or addLineItemLicenseTypes.ts to not scope it by buy/cart/checkout (??)

export async function addLineItemLicenseTypes({
  cl,
  lineItem,
  selectedSkuOptions,
}: AddLineItemLicenseTypes) {
  if (selectedSkuOptions.length > 0) {
    console.log(
      'addLineItemLicenseTypes selectedSkuOptions:',
      selectedSkuOptions
    )
    const lineItemRel = await cl.line_items.relationship(lineItem.id)
    for (const skuOption of selectedSkuOptions) {
      const skuOptionRel = await cl.sku_options.relationship(skuOption.id)
      const lineItemOptionsAttributes: LineItemOptionCreate = {
        quantity: 1,
        options: [],
        sku_option: skuOptionRel,
        line_item: lineItemRel,
      }
      console.log(
        'addLineItemLicenseTypes lineItemOptionsAttributes: ',
        lineItemOptionsAttributes
      )
      await cl.line_item_options.create(lineItemOptionsAttributes)
    }
  }
}
