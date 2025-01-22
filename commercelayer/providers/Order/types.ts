import {
  type CommerceLayerClient,
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'

export interface UpdateLineItemLicenseTypes {
  cl: CommerceLayerClient
  lineItem: LineItem
  selectedSkuOptions: SkuOption[]
}

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

export interface UpdateLineItemsLicenseSize {
  cl: CommerceLayerClient
  order: Order
  licenseSize: LicenseSize
}
