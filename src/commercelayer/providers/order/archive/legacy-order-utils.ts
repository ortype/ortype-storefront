/**
 * ARCHIVE: retired order utils (pre-projection cart model)
 * ========================================================
 *
 * Nothing in the app imports from this file. It was extracted from the old
 * `providers/Order/utils.ts` when `providers/order` was tidied up, and is kept
 * (and type-checked) purely as a reference.
 *
 * Why it was retired
 * ------------------
 * These helpers belong to the model where a font's license types were stored
 * as CL `line_item_options` and each line item was created / patched
 * individually from the client:
 *
 *  - `addToCart`                    -> replaced by `commitGroup` in `../index.tsx`
 *                                      (group / style projections with metadata)
 *  - `createOrUpdateOrder`          -> replaced by `ensureOrder` + the debounced
 *                                      license-metadata write in `../index.tsx`
 *  - `updateLineItemLicenseTypes`   -> license types are now plain metadata on
 *                                      the projection line items (no options)
 *  - `updateLineItemsLicenseSize`   -> replaced by `repriceAll`, which recommits
 *                                      every stale font at the new size
 *
 * The legacy `react-components` reducer types (`OrderPayload`, `OrderActions`,
 * ...) that used to live next to them were dropped entirely; see git history
 * (tag `archive/selections-sync`) if they are ever needed.
 */
import type {
  CommerceLayerClient,
  LineItem,
  LineItemOptionCreate,
  LineItemUpdate,
  Order,
  SkuOption,
} from '@commercelayer/sdk'
import type { LicenseSize } from '../types'

export interface UpdateLineItemLicenseTypes {
  cl: CommerceLayerClient
  lineItem: LineItem
  selectedSkuOptions: SkuOption[]
}

export interface UpdateLineItemsLicenseSize {
  cl: CommerceLayerClient
  order: Order
  licenseSize: LicenseSize
}

export interface AddToCartParams {
  cl: CommerceLayerClient
  orderId?: string
  skuCode: string
  referenceOrigin: string
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
    referenceOrigin,
    quantity,
    lineItemAttributes,
    createOrder,
    fetchOrder,
  } = params

  try {
    // Create or get order if needed
    let currentOrderId = orderId
    if (!currentOrderId && createOrder) {
      const orderResult = await createOrder({
        customMetadata: lineItemAttributes?.metadata,
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
      reference_origin: referenceOrigin,
      quantity,
      _external_price: lineItemAttributes?._external_price,
      metadata: lineItemAttributes?.metadata,
    })

    // Fetch updated order if needed
    if (fetchOrder) {
      const { order: updatedOrder } = await fetchOrder({
        orderId: currentOrderId,
      })
      if (!updatedOrder) {
        throw new Error('Failed to fetch updated order')
      }
    }

    return {
      success: true,
      lineItem,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('addToCart error:', error)
    }
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add item to cart',
        originalError: error,
      },
    }
  }
}

/*
1. First ensures order exists with proper metadata
2. Then handles its specific updates (line items, etc.)
3. Finally fetches and updates state with the latest order
*/
export async function createOrUpdateOrder({
  order,
  createOrder,
  updateOrder,
  licenseSize,
  persistKey,
  getLocalOrder,
  additionalMetadata = {},
}: {
  order?: Order
  createOrder: (params: any) => Promise<{
    success: boolean
    order?: Order
    orderId?: string
  }>
  updateOrder: (params: any) => Promise<{ success: boolean; order?: Order }>
  licenseSize?: LicenseSize
  persistKey?: string
  getLocalOrder: (key: string) => string | undefined
  additionalMetadata?: Record<string, any>
}) {
  const localOrderId = persistKey ? getLocalOrder(persistKey) : undefined

  // Helper function to ensure proper license metadata structure
  const buildLicenseMetadata = (base: any = {}, additions: any = {}) => ({
    license: {
      // Start with existing metadata
      ...base,
      // Add new metadata, preserving nested objects
      ...(additions.owner ? { owner: additions.owner } : {}),
      ...(additions.types ? { types: additions.types } : {}),
      // Size always overrides if provided
      ...(licenseSize ? { size: licenseSize } : {}),
    },
  })

  // Create a new order
  if (!order?.id && !localOrderId) {
    // For new orders, set the complete metadata structure
    const createResult = await createOrder({
      customMetadata: buildLicenseMetadata(
        {}, // Start with empty base for new orders
        additionalMetadata
      ),
    })

    if (!createResult.success || !createResult.orderId) {
      throw new Error('Failed to create order')
    }
    return createResult.orderId
  }

  // Update existing order
  const result = await updateOrder({
    id: order?.id || localOrderId,
    attributes: {
      metadata: buildLicenseMetadata(
        order?.metadata?.license || {}, // Use existing license metadata as base
        additionalMetadata
      ),
    },
  })

  if (!result.success || !result.order) {
    throw new Error('Failed to update order')
  }
  return result.order.id
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
        parentUid: lineItem.item?.reference_origin,
        ...lineItem.metadata?.license,
        types: selectedSkuOptions.map((option) => option.reference),
      },
    },
  }
  await cl.line_items.update(updateLineItemAttrs)

  // Line Item Options and SKU Options
  const lineItemOptions = lineItem.line_item_options ?? []
  const existingSkuOptionIds = lineItemOptions.flatMap(({ sku_option }) =>
    sku_option ? [sku_option.id] : []
  )
  const newSkuOptionIds = selectedSkuOptions.map(({ id }) => id)
  const skuOptionsToAdd = selectedSkuOptions.filter(
    (option) => !existingSkuOptionIds.includes(option.id)
  )
  const lineItemOptionsToDelete = lineItemOptions.filter(
    (option) =>
      !!option.sku_option && !newSkuOptionIds.includes(option.sku_option.id)
  )

  if (skuOptionsToAdd.length > 0) {
    const lineItemRel = cl.line_items.relationship(lineItem.id)
    for (const skuOption of skuOptionsToAdd) {
      const skuOptionRel = cl.sku_options.relationship(skuOption.id)
      const lineItemOptionsAttributes: LineItemOptionCreate = {
        quantity: 1,
        options: [],
        sku_option: skuOptionRel,
        line_item: lineItemRel,
      }
      await cl.line_item_options.create(lineItemOptionsAttributes)
    }
  }

  for (const lineItemOption of lineItemOptionsToDelete) {
    await cl.line_item_options.delete(lineItemOption.id)
  }
}

export async function updateLineItemsLicenseSize({
  cl,
  order,
  licenseSize,
}: UpdateLineItemsLicenseSize) {
  for (const lineItem of order.line_items ?? []) {
    const updateLineItemsAttrs: LineItemUpdate = {
      id: lineItem.id,
      quantity: 1,
      _external_price: true,
      metadata: {
        license: {
          parentUid: lineItem.item?.reference_origin,
          ...lineItem.metadata?.license, // Preserve existing license metadata
          size: licenseSize, // Update size
        },
      },
    }

    await cl.line_items.update(updateLineItemsAttrs)
  }
}
