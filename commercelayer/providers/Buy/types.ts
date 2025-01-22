import {
  type CommerceLayerClient,
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'

export interface AddLineItemLicenseTypes {
  cl: CommerceLayerClient
  lineItem: LineItem
  selectedSkuOptions: SkuOption[]
}
