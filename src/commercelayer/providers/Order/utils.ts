import getCommerceLayer, {
  CommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { sizes } from '@/lib/settings'
import {
  setCustomerOrderParam,
  type CustomerOrderParams,
  type DeleteLocalOrder,
  type SetLocalOrder,
} from '@/utils/localStorage'
import {
  CommerceLayer,
  LineItem,
  LineItemOption,
  type LineItemOptionCreate,
  type LineItemUpdate,
  type Order,
} from '@commercelayer/sdk'
import {
  CustomLineItem,
  ResourceIncluded,
} from 'node_modules/@commercelayer/react-components/lib/esm/reducers/OrderReducer'
import { BaseError } from 'node_modules/@commercelayer/react-components/lib/esm/typings/errors'
import type { Dispatch } from 'react'
import { UpdateLineItemLicenseTypes, UpdateLineItemsLicenseSize } from './types'
import { BaseMetadataObject } from 'node_modules/@commercelayer/react-components/lib/esm/typings'

type ResourceIncludedLoaded = Partial<Record<ResourceIncluded, boolean>>

export interface OrderPayload {
  loading?: boolean
  orderId?: string
  order?: Order
  errors?: BaseError[]
  include?: ResourceIncluded[] | undefined
  includeLoaded?: ResourceIncludedLoaded
  withoutIncludes?: boolean
  manageAdyenGiftCard?: boolean
}

export type OrderActionType =
  | 'setLoading'
  | 'setOrderId'
  | 'setOrder'
  | 'setSingleQuantity'
  | 'setCurrentSkuCodes'
  | 'setCurrentSkuPrices'
  | 'setCurrentItem'
  | 'setErrors'
  | 'setSaveAddressToCustomerAddressBook'
  | 'setGiftCardOrCouponCode'
  | 'setIncludesResource'

export interface OrderActions {
  type: OrderActionType
  payload: OrderPayload
}

export type OrderState = {
  order?: Order
  orderId?: string
  errors?: BaseError[]
}

type CreateOrderParams = {
  config: CommerceLayerConfig
  metadata?: Record<string, any>
  attributes?: Record<string, any>
}

type CreateOrderError = {
  message: string
  originalError?: unknown
}

interface CreateOrderResult {
  success: boolean
  order?: Order
  error?: CreateOrderError
}

export interface AddToCartParams {
  cl: CommerceLayer
  orderId?: string
  skuCode: string
  quantity: number
  lineItemAttributes?: {
    _external_price?: boolean
    metadata?: {
      license?: {
        size?: Record<string, any> // LicenseSize structure
        types?: string[]
      }
    }
  }
  // Optional parameters for backward compatibility
  createOrder?: (params?: {
    customMetadata?: Record<string, any>
    customAttributes?: Record<string, any>
  }) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
    orderId?: string
  }>
  fetchOrder?: (params?: { orderId: string }) => Promise<{
    success: boolean
    order?: Order
  }>
  config?: CommerceLayerConfig
  persistKey?: string
  dispatch?: Dispatch<any>
  state?: Partial<OrderState>
  setLocalOrder?: SetLocalOrder
}

export interface AddToCartResult {
  success: boolean
  error?: {
    message: string
    originalError?: unknown
  }
  lineItem?: LineItem
}

export async function addToCart(
  params: AddToCartParams
): Promise<AddToCartResult> {
  const { 
    cl, 
    orderId,
    skuCode, 
    quantity, 
    lineItemAttributes,
    createOrder,
    fetchOrder,
    config,
    persistKey,
    dispatch,
    state,
    setLocalOrder
  } = params

  try {
    // Create or get order if needed
    let currentOrderId = orderId
    if (!currentOrderId && createOrder) {
      const orderResult = await createOrder({
        customMetadata: lineItemAttributes?.metadata
      })
      if (!orderResult.success || !orderResult.orderId) {
        throw new Error('Failed to create order')
      }
      currentOrderId = orderResult.orderId
    }

    if (!currentOrderId) {
      throw new Error('No order ID available')
    }

    // Create the line item
    const order = cl.orders.relationship(currentOrderId)
    const lineItem = await cl.line_items.create({
      order,
      sku_code: skuCode,
      quantity,
      _external_price: lineItemAttributes?._external_price,
      metadata: lineItemAttributes?.metadata
    })

    // Fetch updated order if needed
    if (fetchOrder) {
      const { order: updatedOrder } = await fetchOrder({ orderId: currentOrderId })
      if (!updatedOrder) {
        throw new Error('Failed to fetch updated order')
      }
    }

    return { 
      success: true, 
      lineItem 
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('addToCart error:', error)
    }
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to add item to cart',
        originalError: error
      }
    }
  }
}

// Focused utility function that only handles SDK interaction
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const { config, metadata, attributes = {} } = params
  const cl = config != null ? getCommerceLayer(config) : undefined

  try {
    if (cl == null) {
      return {
        success: false,
        error: {
          message: 'Commerce Layer client is not initialized',
        },
      }
    }

    const order = await cl.orders.create({ metadata, ...attributes })
    return { success: true, order }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('createOrder error:', error)
    }
    return {
      success: false,
      error: {
        message: 'Failed to create order',
        originalError: error,
      },
    }
  }
}

export function calculateSettings(order: Order) {
  return {
    hasLicenseOwner: Boolean(order.metadata?.license?.owner),
    isLicenseForClient: order.metadata?.license?.owner?.is_client || false,
    licenseOwner: order.metadata?.license?.owner || {},
    licenseSize: order.metadata?.license?.size || sizes[0],
    // @NOTE: well, we don't really want defaults for licenseSize if that needs to be set first to proceed
    /*
        {
        "value": "small",
        "label": "Small (1-5 employees)",
        "modifier": 1
    }
    */
  }
}

export async function createOrUpdateOrder({
  order,
  createOrder,
  updateOrder,
  licenseSize,
}) {
  const localStorageOrderId = localStorage.getItem('order')
  console.log('order: ', order, localStorageOrderId)
  // create a new order
  if (!order?.id && !localStorageOrderId) {
    // const resultAttrs: OrderCreate = {
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.create(newOrderAttrs)
    try {
      const orderId = await createOrder({
        persistKey: 'order',
        setLocalOrder: true,
        orderMetadata: {
          license: { size: licenseSize },
        },
      })
      console.log('Created new order: ', orderId)
      return orderId
    } catch (e) {
      console.log('Error from `createOrUpdateOrder` with `createOrder`: ', e)
    }

    // @TODO: check if we need to manually add orderId to local storage
    // localStorage.setItem('order', newOrder.id)
  } else {
    // const updateOrderAttrs: OrderUpdate = {
    //   id: order?.id || localStorageOrderId,
    //   metadata: { license: { size: licenseSize.value } },
    // }
    // newOrder = await cl.orders.update(updateOrderAttrs)

    try {
      const result = await updateOrder({
        id: order?.id || localStorageOrderId,
        attributes: {
          metadata: {
            license: { ...order.metadata.license, size: licenseSize },
          },
        },
        // there is an `include` param
      })
      console.log('Updated order: ', result)
      return result.order.id
    } catch (e) {
      console.log('Error from `createOrUpdateOrder` calling `updateOrder`: ', e)
    }
  }
}

export async function updateLineItemLicenseTypes({
  cl,
  lineItem,
  selectedSkuOptions,
}: UpdateLineItemLicenseTypes) {
  const updateLineItemAttrs: LineItemUpdate = {
    id: lineItem.id,
    quantity: 1,
    _external_price: true,
    metadata: {
      license: {
        ...lineItem.metadata?.license,
        types: selectedSkuOptions.map((option) => option.reference),
      },
    },
  }
  console.log('updateLineItemAttrs: ', updateLineItemAttrs)
  await cl.line_items.update(updateLineItemAttrs)

  // Line Item Options and SKU Options
  const existingSkuOptionIds = lineItem.line_item_options.map(
    ({ sku_option }) => sku_option.id
  )
  const newSkuOptionIds = selectedSkuOptions.map(({ id }) => id)
  const skuOptionsToAdd = selectedSkuOptions.filter(
    (option) => !existingSkuOptionIds.includes(option.id)
  )
  const lineItemOptionsToDelete = lineItem.line_item_options.filter(
    (option) => !newSkuOptionIds.includes(option.sku_option.id)
  )

  // lineItem.line_item_options
  // we have the options on the lineItem, we can then check if an sku_option.id is present in this array
  // which is not found in selectedSkuOptions, and delete that line_item

  // @TODO: if multiple lineItemOptions can not be created with addToCart
  // then this would need to be updated to read from the metadata of the line_item

  if (skuOptionsToAdd && skuOptionsToAdd.length > 0) {
    console.log('skuOptionsToAdd:', skuOptionsToAdd)
    const lineItemRel = await cl.line_items.relationship(lineItem.id)
    for (const skuOption of skuOptionsToAdd) {
      const skuOptionRel = await cl.sku_options.relationship(skuOption.id)
      const lineItemOptionsAttributes: LineItemOptionCreate = {
        quantity: 1,
        options: [],
        sku_option: skuOptionRel,
        line_item: lineItemRel,
      }
      console.log('lineItemOptionsAttributes: ', lineItemOptionsAttributes)
      await cl.line_item_options.create(lineItemOptionsAttributes)
    }
  }

  if (lineItemOptionsToDelete && lineItemOptionsToDelete.length > 0) {
    console.log('lineItemOptionsToDelete: ', lineItemOptionsToDelete)
    for (const lineItemOption of lineItemOptionsToDelete) {
      await cl.line_item_options.delete(lineItemOption.id)
    }
  }
}

export async function updateLineItemsLicenseSize({
  cl,
  order,
  licenseSize,
}: UpdateLineItemsLicenseSize) {
  for (const lineItem of order?.line_items) {
    console.log('retrievedOrder lineItem: ', lineItem)
    const updateLineItemsAttrs: LineItemUpdate = {
      id: lineItem.id,
      quantity: 1,
      _external_price: true,
      metadata: {
        license: {
          ...lineItem.metadata?.license,
          types: lineItem.metadata.types || ['1-licenseType-desktop'], // @TEMP
          size: licenseSize,
        },
      },
    }
    console.log('updateLineItemsAttrs: ', updateLineItemsAttrs)
    await cl.line_items.update(updateLineItemsAttrs)
  }
}

// Default export containing all utility functions
const utils = {
  addToCart,
  createOrder,
  createOrUpdateOrder,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
}

export default utils
