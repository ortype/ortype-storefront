import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { CLayerClientConfig } from '@/commercelayer/providers/identity/types'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import utils, {
  calculateSettings,
  computeSelectionsHash,
  createOrUpdateOrder,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from '@/commercelayer/providers/Order/utils'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { forceOrderAutorefresh } from '@/commercelayer/utils/forceOrderAutorefresh'
import {
  getParentUid,
  recalculateSiblingPrices,
} from '@/commercelayer/utils/prices'
import { executeBatch, type Task } from '@commercelayer/sdk-utils'
import { getLicenseMetrics } from '@/sanity/lib/client'
import { type CompanySize, type MediaType } from '@/sanity/lib/queries'
import {
  LineItem,
  OrderUpdate,
  SkuOption,
  type Order,
} from '@commercelayer/sdk'
import type { ChildrenElement } from 'CustomApp'
import { getOrder } from './utils/getOrder'

import { toaster } from '@/components/ui/toaster'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { OrderStorageContext } from './Storage'

/*
1. Clean separation between utils and provider:
•  Utils handles core API interactions
•  Provider manages state and orchestrates the flow
•  Proper error typing and handling in both layers
2. Strong TypeScript implementation:
•  Well-defined types for OrderMetadata and OrderAttributes
•  Proper error type definitions
•  Consistent use of success/error return types
3. Good error handling patterns:
•  Consistent try/catch blocks
•  Proper error logging in development
•  Clear error messages
*/

export type LicenseOwnerInput = Pick<LicenseOwner, 'is_client' | 'full_name'>

export type { LicenseSize, StyleEntry, SelectionBuffer } from './types'
import type { LicenseSize, StyleEntry, SelectionBuffer } from './types'

interface UpdateOrderArgs {
  id: string
  attributes: Omit<OrderUpdate, 'id'>
  include?: string[]
}

// Add type definitions for metadata and attributes
type OrderMetadata = {
  license?: {
    owner?: LicenseOwnerInput
    size?: LicenseSize
    types?: string[]
  }
  [key: string]: any
}

type OrderAttributes = {
  [key: string]: any
}

interface AddToCartParams {
  skuCode: string
  quantity?: number
  lineItem?: {
    externalPrice?: boolean
    metadata?: {
      license?: {
        size?: LicenseSize
        types?: string[]
      }
    }
  }
  orderMetadata?: {
    license?: {
      size?: LicenseSize
    }
  }
}

export interface AddToCartError {
  message: string
  originalError?: unknown
}

export interface AddToCartResult {
  success: boolean
  error?: AddToCartError
  order?: Order
  orderId?: string
}

type OrderProviderData = {
  order?: Order
  orderId?: string
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  companySizes: CompanySize[]
  mediaTypes: MediaType[]
  licenseSize: LicenseSize
  createOrder: (params?: {
    customMetadata?: Record<string, any>
    customAttributes?: Record<string, any>
  }) => Promise<AddToCartResult>
  addToCart: (params: AddToCartParams) => Promise<AddToCartResult>
  refetchOrder: () => Promise<{
    success: boolean
    order?: Order
  }>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  hasValidLicenseSize: boolean
  hasValidLicenseType: boolean
  allLicenseInfoSet: boolean
  hasLineItems: boolean
  setLicenseOwner: (params: { licenseOwner?: LicenseOwnerInput }) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
  setLicenseTypes: (params: {
    order?: Order
    lineItem: LineItem
    selectedSkuOptions: SkuOption[]
  }) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
  deleteLineItem: (params: { lineItemId: string }) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  selections: SelectionBuffer
  isCommitted: boolean
  toggleStyle: (params: {
    parentUid: string
    skuCode: string
    styleMetadata: StyleEntry
  }) => void
  toggleGroup: (params: {
    parentUid: string
    styles: { skuCode: string; styleMetadata: StyleEntry }[]
  }) => void
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => void
  commitSelections: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  clearCommittedItems: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
}

export type OrderStateData = {
  order?: Order
  orderId?: string
  licenseOwner?: LicenseOwnerInput // Make optional
  hasLicenseOwner: boolean // Required, with boolean type
  isLicenseForClient: boolean // Required, with boolean type
  hasValidLicenseSize: boolean // Whether licenseSize is valid
  hasValidLicenseType: boolean // Whether license type is valid
  allLicenseInfoSet: boolean // Whether all license info is set
  hasLineItems: boolean // Whether the order has line items
  licenseSize?: LicenseSize // Make optional
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  selections: SelectionBuffer
  isCommitted: boolean
  committedSelectionsHash: string
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  licenseOwner: undefined,
  hasLicenseOwner: false,
  isLicenseForClient: false, // Add default value
  hasValidLicenseSize: false,
  hasValidLicenseType: false,
  allLicenseInfoSet: false,
  hasLineItems: false,
  licenseSize: undefined,
  selectedSkuOptions: [],
  skuOptions: [],
  itemsCount: 0,
  isLoading: true,
  isInvalid: false,
  selections: {},
  isCommitted: false,
  committedSelectionsHash: '',
}

const OrderContext = createContext<OrderProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as OrderProviderData
)

export const useOrderContext = (): OrderProviderData => useContext(OrderContext)

type OrderProviderProps = {
  config: CLayerClientConfig
  children: ((props: OrderProviderData) => ChildrenElement) | ChildrenElement
}

export function OrderProvider({
  children,
  config,
  metadata,
  attributes,
}: OrderProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [companySizes, setCompanySizes] = useState<CompanySize[]>([])
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])

  // Order persistence is handled through OrderStorageContext
  // using getLocalOrder/setLocalOrder for consistent storage management

  // Order creation is handled through createOrder method
  // following our Provider/Reducer/Utils pattern

  const {
    persistKey = 'order',
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder,
  } = useContext(OrderStorageContext)

  const createOrder = useCallback(
    async (params?: {
      customMetadata?: OrderMetadata
      customAttributes?: OrderAttributes
    }): Promise<AddToCartResult> => {
      // Early return if we already have an order ID
      if (state.orderId) {
        return {
          success: true,
          orderId: state.orderId,
          order: state.order,
        }
      }

      dispatch({ type: ActionType.START_LOADING })
      const cl = isValidCommerceLayerConfig(config)
        ? getCommerceLayer(config)
        : undefined

      try {
        if (cl == null) {
          throw new Error('Commerce Layer client not initialized')
        }

        // Combine default metadata/attributes with custom ones if provided
        const mergedMetadata: OrderMetadata = {
          license: {
            ...(metadata?.license || {}),
            ...(params?.customMetadata?.license || {}),
          },
          ...(metadata || {}),
          ...(params?.customMetadata || {}),
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] createOrder: mergedMetadata:', {
            metadata,
            customMetadata: params?.customMetadata,
            merged: mergedMetadata,
          })
        }

        const mergedAttributes: OrderAttributes = {
          ...attributes,
          ...params?.customAttributes,
        }

        // Create the order using the utility function
        const result = await utils.createOrder({
          config,
          metadata: mergedMetadata,
          attributes: mergedAttributes,
        })

        if (!result.success || !result.order) {
          return { success: false, error: result.error }
        }

        const order = result.order
        const orderId = order.id

        // Store the order ID in localStorage if persistKey is provided
        if (persistKey && setLocalOrder) {
          setLocalOrder(persistKey, orderId)
        }

        // Calculate additional settings based on the order
        const orderSettings = calculateSettings(order)

        // Calculate the number of items in the order
        const itemsCount = (order.line_items || []).length

        // Dispatch the CREATE_ORDER action
        dispatch({
          type: ActionType.CREATE_ORDER,
          payload: {
            order,
            orderId,
            others: {
              itemsCount,
              isInvalid: false,
              ...orderSettings,
            },
          },
        })

        return { success: true, order, orderId }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error creating order:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error ? error.message : 'Failed to create order',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      metadata,
      attributes,
      persistKey,
      setLocalOrder,
      state.orderId,
      state.order,
    ]
  )

  const fetchOrder = useCallback(
    async (params?: {
      orderId: string
    }): Promise<{
      success: boolean
      order?: Order // Assuming Order is your type for order object
    }> => {
      const orderId =
        params?.orderId ?? (persistKey ? getLocalOrder(persistKey) : undefined)
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!orderId || cl == null) {
          return { success: false }
        }
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] fetchOrder: ', orderId)
        }
        const orderResponse = await getOrder({ client: cl, orderId })
        const order = orderResponse?.object

        // If clearWhenPlaced is enabled and the order has been placed (not editable),
        // clear it from localStorage and reset state
        const shouldClearPlacedOrder = !!(persistKey && clearWhenPlaced)
        if (shouldClearPlacedOrder && order && order.editable === false) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              '[OrderProvider] fetchOrder: Order has been placed, clearing local storage',
              { orderId, persistKey }
            )
          }
          deleteLocalOrder(persistKey)
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order: undefined,
              others: {
                orderId: undefined,
                itemsCount: 0,
                isInvalid: false,
              },
            },
          })
          return { success: true, order: undefined }
        }

        // Handle order metadata after initial creation
        if (order && !order.metadata?.license) {
          const settings = calculateSettings(order)
          order.metadata = {
            license: {
              size: settings.licenseSize,
              types: settings.types || [], // Initialize types array
            },
          }
        }

        // @NOTE: consider these utils for checking the orderId and order object
        // import { isValidOrderIdFormat } from '@/utils/isValidOrderIdFormat'
        // if (!isValidOrderIdFormat(orderId)) {
        // console.log('Invalid: Order Id format')
        // import { isValidStatus } from '@/utils/isValidStatus'
        // if (!isValidStatus(order.status)) {
        // console.log('Invalid: Order status')

        order &&
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order,
              others: {
                itemsCount: (order?.line_items || []).length,
                isInvalid: !order,
                orderId,
                ...calculateSettings(order),
              },
            },
          })
        return { success: true, order }
      } catch (error) {
        return { success: false }
      }
    },
    [config, persistKey, clearWhenPlaced, getLocalOrder, deleteLocalOrder]
  )

  const updateOrder = useCallback(
    async ({
      id,
      attributes,
      include,
    }: UpdateOrderArgs): Promise<{
      success: boolean
      error?: AddToCartError // Update to use same error type
      order?: Order
    }> => {
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (cl == null) {
          return { success: false }
        }

        const resource = { ...attributes, id }
        await cl.orders.update(resource, { include })
        const { order } = await fetchOrder()

        order &&
          dispatch({
            type: ActionType.UPDATE_ORDER,
            payload: {
              order,
            },
          })

        return { success: true, order }
      } catch (error) {
        // Remove : any type
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error updating order:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error ? error.message : 'Failed to update order',
            originalError: error,
          },
        }
      }
    },
    [config, fetchOrder]
  )

  const fetchSkuOptions = useCallback(
    async (
      existingTypes: string[] = [],
      mediaTypes: MediaType[] = []
    ): Promise<{
      success: boolean
      error?: AddToCartError
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!cl) {
          throw new Error('Commerce Layer client not initialized')
        }

        let skuOptions = await cl.sku_options.list()

        // Sort sku_options to match the order defined in Sanity media types
        if (mediaTypes.length > 0) {
          const mediaKeyOrder = new Map(mediaTypes.map((m, i) => [m._key, i]))
          skuOptions.sort((a, b) => {
            const aIdx = mediaKeyOrder.get(a.reference) ?? Infinity
            const bIdx = mediaKeyOrder.get(b.reference) ?? Infinity
            return aIdx - bIdx
          })
        }

        // Find matching sku options for existing types
        const existingSelectedOptions = skuOptions.filter((option) =>
          existingTypes.includes(option.reference)
        )

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] 🎯 fetchSkuOptions: Processing types and options:',
            {
              existingTypes,
              matchingOptions: existingSelectedOptions.map((opt) => ({
                id: opt.id,
                name: opt.name,
                reference: opt.reference,
              })),
              allOptionsCount: skuOptions.length,
              allOptionsReferences: skuOptions.map((opt) => opt.reference),
            }
          )
        }

        dispatch({
          type: ActionType.SET_SKU_OPTIONS,
          payload: {
            skuOptions,
            others: {
              selectedSkuOptions: existingSelectedOptions,
              hasValidLicenseType: existingSelectedOptions.length > 0,
            },
          },
        })
        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching SKU options:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch SKU options',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config]
  ) // Only depend on config, not on state

  const setLicenseOwner = useCallback(
    async (params: {
      licenseOwner?: LicenseOwnerInput
    }): Promise<{
      success: boolean
      error?: AddToCartError
      order?: Order
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] setLicenseOwner: Starting with params:', {
          licenseOwner: params.licenseOwner,
          hasOrder: !!state.order,
          orderId: state.orderId,
          hasLicenseSize: !!state.licenseSize?.value,
          currentOrderMetadata: state.order?.metadata,
        })
      }

      try {
        if (!params.licenseOwner || !cl) {
          throw new Error(
            'Missing license owner or Commerce Layer client not initialized'
          )
        }

        // Track the operation for better error messages
        const operationName = 'Set license owner'

        // Use createOrUpdateOrder for both new and existing orders
        const licenseOwnerMetadata = {
          owner: {
            is_client: params.licenseOwner.is_client,
            full_name: params.licenseOwner.full_name,
          },
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            'setLicenseOwner: Using createOrUpdateOrder with metadata:',
            {
              licenseOwnerMetadata,
              hasOrder: !!state.order,
              hasOrderId: !!state.orderId,
              licenseSize: state.licenseSize,
            }
          )
        }

        const orderId = await createOrUpdateOrder({
          order: state.order,
          createOrder,
          updateOrder,
          licenseSize: state.licenseSize,
          persistKey,
          getLocalOrder,
          additionalMetadata: licenseOwnerMetadata,
        })

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            'setLicenseOwner: createOrUpdateOrder returned orderId:',
            orderId,
            {
              licenseOwner: params.licenseOwner,
              existingMetadata: state.order?.metadata,
              licenseSize: state.licenseSize,
              selectedSkuOptions: state.selectedSkuOptions,
              isNewOrder: !state.orderId,
            }
          )
        }

        if (!orderId) {
          throw new Error('Failed to create or update order with license owner')
        }

        const { order, success } = await fetchOrder({ orderId })

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] setLicenseOwner: fetchOrder result:', {
            success,
            hasOrder: !!order,
          })
        }

        if (!success || !order) {
          throw new Error(
            'Failed to fetch updated order after setting license owner'
          )
        }

        // Validate that the license owner was properly set
        const updatedLicenseOwner = order.metadata?.license?.owner
        if (!updatedLicenseOwner?.full_name) {
          throw new Error(
            'License owner was not properly set in order metadata'
          )
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] setLicenseOwner: Order metadata:', {
            metadata: order.metadata,
            license: order.metadata?.license,
            owner: order.metadata?.license?.owner,
          })
        }

        const licenseOwner =
          order.metadata?.license?.owner || params.licenseOwner

        dispatch({
          type: ActionType.SET_LICENSE_OWNER,
          payload: {
            order,
            others: {
              hasLicenseOwner: !!licenseOwner,
              isLicenseForClient: licenseOwner?.is_client ?? false,
              licenseOwner: licenseOwner || { is_client: false, full_name: '' },
            },
          },
        })

        // Show success notification
        /*toaster.create({
          title: 'License owner updated successfully',
          type: 'success',
          duration: 2000,
        })*/

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in setLicenseOwner:', {
            errorMessage:
              error instanceof Error ? error.message : String(error),
            stateInfo: {
              hasOrder: !!state.order,
              orderId: state.orderId,
              hasLicenseSize: !!state.licenseSize?.value,
              currentOrderMetadata: state.order?.metadata,
            },
          })
        }

        // Show error notification
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set license owner'
        toaster.create({
          title: 'Failed to update license owner',
          description: errorMessage,
          type: 'error',
          duration: 3000,
        })

        return {
          success: false,
          error: {
            message: errorMessage,
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      createOrder,
      updateOrder,
      fetchOrder,
      state.order,
      state.licenseSize,
      persistKey,
      getLocalOrder,
    ]
  )

  /**
   * Adds an item to the cart, creating a new order if necessary.
   *
   * @param params - Parameters for adding item to cart
   * @param params.skuCode - The SKU code of the item to add
   * @param params.quantity - Optional quantity (defaults to 1)
   * @param params.lineItem - Optional line item attributes
   * @param params.lineItem.externalPrice - Whether to use external pricing
   * @param params.lineItem.metadata - Additional metadata for the line item
   * @param params.lineItem.metadata.license - License information for the item
   * @param params.orderMetadata - Optional metadata for the order if one needs to be created
   *
   * @returns Promise resolving to result object containing:
   * - success: boolean indicating if operation was successful
   * - error?: error information if operation failed
   * - order?: the updated order if successful
   * - orderId?: the ID of the order if successful
   */
  const addToCart = useCallback(
    async (params: AddToCartParams): Promise<AddToCartResult> => {
      dispatch({ type: ActionType.START_LOADING })

      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (!cl) {
          throw new Error('Commerce Layer client not initialized')
        }

        // Add to cart using utils function
        const result = await utils.addToCart({
          cl,
          orderId: state.orderId,
          skuCode: params.skuCode,
          quantity: params.quantity ?? 1,
          lineItemAttributes: {
            _external_price: params.lineItem?.externalPrice,
            metadata: params.lineItem?.metadata,
          },
          createOrder,
          fetchOrder,
          config,
          persistKey,
          dispatch,
          state,
          setLocalOrder,
        })

        if (!result.success) {
          throw result.error
        }

        // Better to get it from the result? Its the same.
        // console.log('utils.addToCart result: ', result)
        // const parentUid = result.lineItem?.metadata?.parentUid
        const parentUid = params.lineItem?.metadata?.parentUid

        // Recalculate prices for remaining siblings in the same parentUid group
        if (parentUid && state.order?.line_items?.length) {
          const hasSiblings = state.order.line_items.some(
            (li) =>
              (li.item_type === 'skus' || li.item_type === 'bundles') &&
              getParentUid(li) === parentUid
          )
          if (hasSiblings) {
            await recalculateSiblingPrices({
              cl,
              order: state.order,
              parentUid,
            })

            // Refetch to get updated prices in state
            // @TODO: Do we need this if recalculateSiblingPrices forces autorefresh?
            const { order: refreshedOrder } = await fetchOrder()
            if (refreshedOrder) {
              dispatch({
                type: ActionType.DELETE_LINE_ITEM,
                payload: { order: refreshedOrder },
              })
              return { success: true }
            }
          }
        }

        // Since fetchOrder was called in utils.addToCart, we should have an updated order state
        // But we still need to update our local state through the reducer
        if (state.order) {
          dispatch({
            type: ActionType.ADD_TO_CART,
            payload: {
              order: state.order,
              orderId: state.orderId,
              others: {
                itemsCount: (state.order.line_items || []).length,
                ...calculateSettings(state.order),
              },
            },
          })
        }

        return {
          success: true,
          order: state.order,
          orderId: state.orderId,
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error adding to cart:', error)
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add item to cart'
        return {
          success: false,
          error: {
            message: errorMessage,
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      createOrder,
      fetchOrder,
      state.orderId,
      state.order,
      persistKey,
      setLocalOrder,
    ]
  )

  const setLicenseSize = useCallback(
    async (params: {
      licenseSize?: LicenseSize
    }): Promise<{
      success: boolean
      error?: AddToCartError
      order?: Order
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      // @TODO: dispatch a notifcation to the user that "All your bag items will be adjusted"
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (config == null || !params.licenseSize) {
          throw new Error(
            'Commerce Layer client not initialized or license size not provided'
          )
        }

        // Track the operation for better error messages
        const operationName = 'Set license size'

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] OrderProvider.setLicenseSize: ',
            params.licenseSize
          )
        }

        const orderId = await createOrUpdateOrder({
          createOrder,
          updateOrder,
          order: state.order,
          licenseSize: params.licenseSize,
          persistKey,
          getLocalOrder,
        })

        if (!orderId) {
          throw new Error('Failed to create or update order with license size')
        }

        // @NOTE: if we already have state.order we should update the line_items
        if (state.order) {
          await updateLineItemsLicenseSize({
            cl,
            order: state.order,
            licenseSize: params.licenseSize,
          })
        }

        const { order } = await fetchOrder({ orderId })

        if (!order) {
          throw new Error(
            'Failed to fetch updated order after setting license size'
          )
        }

        dispatch({
          type: ActionType.SET_LICENSE_SIZE,
          payload: {
            licenseSize: params.licenseSize,
            order,
          },
        })

        // Show success notification
        /*toaster.create({
          title: 'License size updated successfully',
          type: 'success',
          duration: 2000,
        })*/

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting license size:', error)
        }

        // Show error notification
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set license size'
        toaster.create({
          title: 'Failed to update license size',
          description: errorMessage,
          type: 'error',
          duration: 3000,
        })

        return {
          success: false,
          error: {
            message: errorMessage,
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, createOrder, updateOrder, fetchOrder, state.order]
  )

  // @NOTE: this method is used in the cart to selectively update a single line item
  const setLicenseTypes = useCallback(
    async (params: {
      lineItem: LineItem
      selectedSkuOptions: SkuOption[]
    }): Promise<{
      success: boolean
      error?: AddToCartError
      order?: Order
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] setLicenseTypes: Starting with params:', {
          hasOrder: !!state.order,
          orderId: state.orderId,
          hasLineItems: !!(
            state.order?.line_items && state.order.line_items.length > 0
          ),
          currentOrderMetadata: state.order?.metadata,
          selectedSkuOptions: params.selectedSkuOptions,
        })
      }

      try {
        if (!cl || !params.lineItem || !params.selectedSkuOptions) {
          throw new Error(
            'Missing required parameters or Commerce Layer client not initialized'
          )
        }

        // Track the operation for better error messages
        const operationName = 'Set license types'
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] setLicenseTypes: Updating line item license types'
          )
        }

        await updateLineItemLicenseTypes({
          cl,
          selectedSkuOptions: params.selectedSkuOptions,
          lineItem: params.lineItem,
        })

        const { order, success } = await fetchOrder({ orderId: state.orderId })

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] setLicenseTypes: fetchOrder result:', {
            success,
            hasOrder: !!order,
            updatedMetadata: order?.metadata?.license,
          })
        }

        if (!success || !order) {
          throw new Error(
            'Failed to fetch updated order after setting license types'
          )
        }

        dispatch({
          type: ActionType.SET_LICENSE_TYPES,
          payload: {
            order,
            others: {
              selectedSkuOptions: params.selectedSkuOptions,
            },
          },
        })

        // Show success notification
        /*toaster.create({
          title: 'License types updated successfully',
          type: 'success',
          duration: 2000,
        })*/

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in setLicenseTypes:', {
            errorMessage:
              error instanceof Error ? error.message : String(error),
            stateInfo: {
              hasOrder: !!state.order,
              orderId: state.orderId,
              hasLineItems: !!(
                state.order?.line_items && state.order.line_items.length > 0
              ),
              currentOrderMetadata: state.order?.metadata,
            },
          })
        }

        // Show error notification
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set license types'
        toaster.create({
          title: 'Failed to update license types',
          description: errorMessage,
          type: 'error',
          duration: 3000,
        })

        return {
          success: false,
          error: {
            message: errorMessage,
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      createOrder,
      updateOrder,
      fetchOrder,
      state.order,
      state.licenseSize,
      persistKey,
      getLocalOrder,
    ]
  )

  const deleteLineItem = useCallback(
    async (params: {
      lineItemId: string
    }): Promise<{
      success: boolean
      error?: AddToCartError
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (config == null) {
          throw new Error('Commerce Layer client not initialized')
        }

        if (!params.lineItemId) {
          throw new Error('Line item ID is required')
        }

        // Read the parentUid before deleting so we can recalculate siblings
        const deletedItem = state.order?.line_items?.find(
          (li) => li.id === params.lineItemId
        )
        const parentUid = deletedItem ? getParentUid(deletedItem) : ''

        await cl.line_items.delete(params.lineItemId)
        const { order } = await fetchOrder()

        if (!order) {
          throw new Error(
            'Failed to fetch updated order after deleting line item'
          )
        }

        // Recalculate prices for remaining siblings in the same parentUid group
        if (parentUid && order.line_items?.length) {
          const hasSiblings = order.line_items.some(
            (li) =>
              (li.item_type === 'skus' || li.item_type === 'bundles') &&
              getParentUid(li) === parentUid
          )
          if (hasSiblings) {
            await recalculateSiblingPrices({ cl, order, parentUid })

            // Refetch to get updated prices in state
            // @TODO: Do we need this if recalculateSiblingPrices forces autorefresh?
            const { order: refreshedOrder } = await fetchOrder()
            if (refreshedOrder) {
              dispatch({
                type: ActionType.DELETE_LINE_ITEM,
                payload: { order: refreshedOrder },
              })
              return { success: true }
            }
          }
        }

        dispatch({
          type: ActionType.DELETE_LINE_ITEM,
          payload: { order },
        })

        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error deleting line item:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to delete line item',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, fetchOrder, state.order]
  )

  const setSelectedSkuOptions = useCallback(
    async (params: {
      selectedSkuOptions: SkuOption[]
      font: any // @TODO font type
    }): Promise<{
      success: boolean
      error?: AddToCartError
      order?: Order
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] setSelectedSkuOptions: Starting with params:',
          {
            hasOrder: !!state.order,
            orderId: state.orderId,
            font: params.font?.shortName,
            selectedSkuOptions: params.selectedSkuOptions,
            currentOrderMetadata: state.order?.metadata,
          }
        )
      }

      try {
        // Improved validation with specific error messages
        if (config == null) {
          throw new Error('Commerce Layer client not initialized')
        }

        if (!params.font) {
          throw new Error('Font information is required')
        }

        if (
          !params.selectedSkuOptions ||
          params.selectedSkuOptions.length === 0
        ) {
          throw new Error('At least one license type must be selected')
        }

        // Structure the license types metadata for createOrUpdateOrder
        // Note: createOrUpdateOrder expects additionalMetadata to contain the license object contents
        const licenseTypesMetadata = {
          types: params.selectedSkuOptions.map((option) => option.reference),
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '🔧 setSelectedSkuOptions: Using createOrUpdateOrder with metadata:',
            {
              licenseTypesMetadata,
              selectedTypes: params.selectedSkuOptions.map(
                (opt) => opt.reference
              ),
              existingLicenseMetadata: state.order?.metadata?.license,
              hasOrder: !!state.order,
              hasOrderId: !!state.orderId,
              licenseSize: state.licenseSize,
            }
          )
        }

        // Create or update order if it doesn't exist
        const orderId = await createOrUpdateOrder({
          order: state.order,
          createOrder,
          updateOrder,
          licenseSize: state.licenseSize,
          persistKey,
          getLocalOrder,
          additionalMetadata: licenseTypesMetadata,
        })

        if (!orderId) {
          throw new Error('Failed to create or update order')
        }

        // When you change the License Size in Dinamo buy page, a notification appears
        // stating all items will be updated and confirms that choice. When you change the global
        // license type, they show an inline notification on that SKU item.

        // @TODO: Trigger notifcation stating that all items in the Cart for this font will be updated
        // Alternatively: add a inline notification to skus that have already been added to the cart,
        // with a calculated price based on that line_items skuOptions

        if (state.order?.line_items && state.order.line_items.length > 0) {
          // Find line items from this font
          const lineItemsOfFont = state.order.line_items.filter((lineItem) =>
            params.font.variants.some(
              (fontVariant) => fontVariant._id === lineItem.sku_code
            )
          )

          if (process.env.NODE_ENV !== 'production') {
            console.log('[OrderProvider] lineItemsOfFont: ', lineItemsOfFont)
          }

          for (const lineItem of lineItemsOfFont) {
            await updateLineItemLicenseTypes({
              cl,
              lineItem,
              selectedSkuOptions: params.selectedSkuOptions,
            })
          }
        }

        const { order, success } = await fetchOrder()

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] setSelectedSkuOptions: fetchOrder result:',
            {
              success,
              hasOrder: !!order,
              updatedMetadata: order?.metadata?.license,
            }
          )
        }

        if (!success || !order) {
          throw new Error(
            'Failed to fetch updated order after setting selected SKU options'
          )
        }

        // Validate that license types were properly set in metadata
        const updatedTypes = order.metadata?.license?.types
        if (
          !updatedTypes ||
          !Array.isArray(updatedTypes) ||
          updatedTypes.length === 0
        ) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              'License types may not have been properly persisted:',
              {
                licenseMetadata: order.metadata?.license,
                expectedTypes: params.selectedSkuOptions.map(
                  (option) => option.reference
                ),
              }
            )
          }
          // Don't throw here, just log the warning as the selection might still work
        }

        dispatch({
          type: ActionType.SET_LICENSE_TYPES,
          payload: {
            order,
            others: {
              selectedSkuOptions: params.selectedSkuOptions,
              // Ensure consistent state by using both the passed selection and metadata
              hasValidLicenseType: params.selectedSkuOptions.length > 0,
            },
          },
        })

        // Show success notification
        /*toaster.create({
          title: 'License types updated successfully',
          type: 'success',
          duration: 2000,
        })*/

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in setSelectedSkuOptions:', {
            errorMessage:
              error instanceof Error ? error.message : String(error),
            stateInfo: {
              hasOrder: !!state.order,
              orderId: state.orderId,
              hasLineItems: !!(
                state.order?.line_items && state.order.line_items.length > 0
              ),
              currentOrderMetadata: state.order?.metadata,
            },
          })
        }

        // Show error notification
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to set license types'
        toaster.create({
          title: 'Failed to update license types',
          description: errorMessage,
          type: 'error',
          duration: 3000,
        })

        return {
          success: false,
          error: {
            message: errorMessage,
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, fetchOrder, state.order]
  )

  const refetchOrder = useCallback(async (): Promise<{
    success: boolean
    order?: Order
  }> => {
    return await fetchOrder()
  }, [fetchOrder])

  // Create a stable initialization function
  const initializeProvider = useCallback(async () => {
    if (!config.accessToken) return

    dispatch({ type: ActionType.START_LOADING })
    try {
      // Sequential initialization
      const { order, success } = await fetchOrder()

      // Always fetch SKU options, passing existing license types if order exists
      let existingTypes: string[] = []

      if (success && order) {
        // If order is found, use its license types
        existingTypes = order.metadata?.license?.types || []

        // Hydrate selections from order metadata if available
        if (order.metadata?.selections) {
          dispatch({
            type: ActionType.HYDRATE_SELECTIONS,
            payload: { selections: order.metadata.selections },
          })

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              '[OrderProvider] 🔄 initializeProvider: Hydrated selections from order metadata',
              {
                selectionCount: Object.values(
                  order.metadata.selections as Record<string, Record<string, unknown>>
                ).reduce(
                  (total: number, group) => total + Object.keys(group).length,
                  0
                ),
              }
            )
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[Order Provider] 🔄 initializeProvider: Found existing order with types:',
            {
              orderId: order.id,
              existingTypes,
              fullMetadata: order.metadata,
              licenseMetadata: order.metadata?.license,
            }
          )
        }
      } else {
        // If no order is found, use empty array
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[Order Provider] 🔄 initializeProvider: No existing order found, using empty types array',
            {
              success,
              hasOrder: !!order,
            }
          )
        }
      }

      // Fetch metrics from Sanity
      const metricsResult = await getLicenseMetrics()

      if (metricsResult.sizes.length > 0) {
        setCompanySizes(metricsResult.sizes)
      }

      if (metricsResult.media.length > 0) {
        setMediaTypes(metricsResult.media)
      }

      // Reconcile stale licenseSize with current Sanity data
      const storedSize = order?.metadata?.license?.size
      if (storedSize?.value && metricsResult.sizes.length > 0) {
        const sanitySize = metricsResult.sizes.find(
          (s) => s.value === storedSize.value
        )
        if (
          sanitySize &&
          (sanitySize.modifier !== storedSize.modifier ||
            sanitySize.label !== storedSize.label)
        ) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              '[OrderProvider] 🔄 initializeProvider: Reconciling stale licenseSize',
              { stored: storedSize, sanity: sanitySize }
            )
          }
          await setLicenseSize({
            licenseSize: {
              label: sanitySize.label,
              value: sanitySize.value,
              modifier: sanitySize.modifier,
            },
          })
        }
      }

      const skuResult = await fetchSkuOptions(
        existingTypes,
        metricsResult.media
      )

      if (!skuResult.success) {
        console.warn('Failed to fetch SKU options during initialization')
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] ✅ initializeProvider: Initialized with', {
          skuOptions: skuResult.success,
          companySizes: metricsResult.sizes.length,
          mediaTypes: metricsResult.media.length,
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error during provider initialization:', error)
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [config.accessToken, fetchOrder, fetchSkuOptions])

  // Update the useEffect to use the stable initialization function
  useEffect(() => {
    initializeProvider()
  }, [initializeProvider])

  // --- Background metadata sync ---
  // Debounced write of selections to order.metadata.selections
  // Fire-and-forget: does not block UI. React state is the source of truth.
  const metadataSyncRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSyncedHashRef = useRef('')

  useEffect(() => {
    // Only sync when order exists and selections have changed
    if (!state.orderId || !state.order?.id) return

    const currentHash = computeSelectionsHash(state.selections)
    if (currentHash === lastSyncedHashRef.current) return

    // Clear previous debounce
    if (metadataSyncRef.current) {
      clearTimeout(metadataSyncRef.current)
    }

    metadataSyncRef.current = setTimeout(async () => {
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (!cl || !state.order?.id) return

        await cl.orders.update({
          id: state.order.id,
          metadata: {
            ...state.order.metadata,
            selections: state.selections,
          },
        })

        lastSyncedHashRef.current = currentHash

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] 📝 Metadata sync: selections written to order metadata'
          )
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[OrderProvider] ⚠️ Metadata sync failed (non-blocking):',
            error
          )
        }
      }
    }, 1500)

    return () => {
      if (metadataSyncRef.current) {
        clearTimeout(metadataSyncRef.current)
      }
    }
  }, [state.selections, state.orderId, state.order?.id, config])

  // --- Selection buffer methods (pure state updates, no API calls) ---

  const toggleStyle = useCallback(
    (params: {
      parentUid: string
      skuCode: string
      styleMetadata: StyleEntry
    }) => {
      dispatch({
        type: ActionType.TOGGLE_STYLE,
        payload: params,
      })
    },
    []
  )

  const toggleGroup = useCallback(
    (params: {
      parentUid: string
      styles: { skuCode: string; styleMetadata: StyleEntry }[]
    }) => {
      dispatch({
        type: ActionType.TOGGLE_GROUP,
        payload: params,
      })
    },
    []
  )

  const setStyleLicenseTypes = useCallback(
    (params: {
      parentUid: string
      skuCode: string
      licenseTypes: string[]
    }) => {
      dispatch({
        type: ActionType.SET_STYLE_LICENSE_TYPES,
        payload: params,
      })
    },
    []
  )

  const commitSelections = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    dispatch({ type: ActionType.START_LOADING })

    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      if (!state.orderId || !state.order?.id) {
        throw new Error('Order must exist before committing selections')
      }

      const selections = state.selections
      if (Object.keys(selections).length === 0) {
        throw new Error('No selections to commit')
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] commitSelections: Starting commit', {
          orderId: state.orderId,
          groupCount: Object.keys(selections).length,
          totalStyles: Object.values(selections).reduce(
            (total, group) => total + Object.keys(group).length,
            0
          ),
        })
      }

      // 1. Disable auto-refresh to prevent N recalculations
      await cl.orders.update({ id: state.order.id, autorefresh: false })

      // 2. Build batch tasks from selections
      const tasks: Task[] = []
      const orderRel = cl.orders.relationship(state.orderId)

      for (const [parentUid, styles] of Object.entries(selections)) {
        const groupSize = Object.keys(styles).length

        for (const [skuCode, styleEntry] of Object.entries(styles)) {
          // Create line item task
          tasks.push({
            resourceType: 'line_items',
            operation: 'create',
            resource: {
              order: orderRel,
              sku_code: skuCode,
              reference_origin: parentUid,
              quantity: 1,
              _external_price: true,
              metadata: {
                parentUid,
                parentName: styleEntry.parentName,
                defaultVariantId: styleEntry.defaultVariantId,
                batchSize: groupSize,
                license: {
                  size: state.licenseSize,
                  types: styleEntry.licenseTypes,
                },
              },
            },
            onFailure: {
              errorHandler: (err) => {
                console.error(
                  `[commitSelections] Failed to create line item ${skuCode}:`,
                  err
                )
              },
            },
          })
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[OrderProvider] commitSelections: Executing batch with ${tasks.length} tasks`
        )
      }

      // 3. Execute batch (rate-limited, sequential)
      await executeBatch({ tasks })

      // 4. After line items are created, add line_item_options for license types
      // Fetch the order to get the created line items with their IDs
      const { order: orderWithItems } = await fetchOrder()
      if (orderWithItems?.line_items?.length) {
        const optionTasks: Task[] = []

        for (const lineItem of orderWithItems.line_items) {
          if (
            lineItem.item_type !== 'skus' &&
            lineItem.item_type !== 'bundles'
          )
            continue

          const parentUid = lineItem.metadata?.parentUid ?? ''
          const skuCode = lineItem.sku_code ?? ''
          const styleEntry = skuCode ? selections[parentUid]?.[skuCode] : undefined
          if (!styleEntry) continue

          // Find matching SKU options for this style's license types
          const matchingOptions = state.skuOptions.filter((opt) =>
            styleEntry.licenseTypes.includes(opt.reference)
          )

          for (const skuOption of matchingOptions) {
            optionTasks.push({
              resourceType: 'line_item_options',
              operation: 'create',
              resource: {
                quantity: 1,
                options: {},
                sku_option: cl.sku_options.relationship(skuOption.id),
                line_item: cl.line_items.relationship(lineItem.id),
              },
              onFailure: {
                errorHandler: (err) => {
                  console.error(
                    `[commitSelections] Failed to create line_item_option for ${lineItem.sku_code}:`,
                    err
                  )
                },
              },
            })
          }
        }

        if (optionTasks.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitSelections: Creating ${optionTasks.length} line_item_options`
            )
          }
          await executeBatch({ tasks: optionTasks })
        }
      }

      // 5. Re-enable auto-refresh and trigger a single refresh
      await forceOrderAutorefresh({ client: cl, order: { ...state.order, autorefresh: false } })

      // 6. Fetch the fully refreshed order
      const { order: refreshedOrder } = await fetchOrder()
      if (!refreshedOrder) {
        throw new Error('Failed to fetch order after commit')
      }

      // 7. Mark as committed with a hash for change detection
      const hash = computeSelectionsHash(selections)
      dispatch({
        type: ActionType.SET_COMMITTED,
        payload: { committedSelectionsHash: hash },
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] commitSelections: Commit complete', {
          lineItemCount: refreshedOrder.line_items?.length,
        })
      }

      return { success: true }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[OrderProvider] commitSelections error:', error)
      }

      // Attempt to re-enable autorefresh on failure
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (cl && state.order?.id) {
          await cl.orders.update({
            id: state.order.id,
            autorefresh: true,
          })
        }
      } catch {
        // Best-effort recovery
      }

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to commit selections',
          originalError: error,
        },
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [
    config,
    state.orderId,
    state.order,
    state.selections,
    state.licenseSize,
    state.skuOptions,
    fetchOrder,
  ])

  /**
   * Clears committed line items from the CL order when the user exits
   * checkout and has modified selections (Option A).
   * The selection buffer is preserved so the user can edit and return.
   * Only deletes if selections have actually changed since last commit.
   */
  const clearCommittedItems = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    // Nothing to clear if not committed
    if (!state.isCommitted) {
      return { success: true }
    }

    // Check if selections have changed since commit
    const currentHash = computeSelectionsHash(state.selections)
    if (currentHash === state.committedSelectionsHash) {
      // Selections unchanged — committed line items are still valid
      return { success: true }
    }

    dispatch({ type: ActionType.START_LOADING })

    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      if (!state.order?.id) {
        throw new Error('No order to clear items from')
      }

      // Get current line items to delete
      const lineItems = state.order.line_items?.filter(
        (li) => li.item_type === 'skus' || li.item_type === 'bundles'
      )

      if (!lineItems?.length) {
        dispatch({ type: ActionType.CLEAR_COMMITTED })
        return { success: true }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] clearCommittedItems: Deleting committed line items',
          { count: lineItems.length }
        )
      }

      // Disable autorefresh during bulk delete
      await cl.orders.update({ id: state.order.id, autorefresh: false })

      // Batch-delete all committed line items
      const deleteTasks: Task[] = lineItems.map((li) => ({
        resourceType: 'line_items' as const,
        operation: 'delete' as const,
        resource: { id: li.id },
        onFailure: {
          errorHandler: (err: unknown) => {
            console.error(
              `[clearCommittedItems] Failed to delete ${li.sku_code}:`,
              err
            )
          },
        },
      }))

      await executeBatch({ tasks: deleteTasks })

      // Re-enable autorefresh
      await forceOrderAutorefresh({
        client: cl,
        order: { ...state.order, autorefresh: false },
      })

      // Fetch cleaned order
      await fetchOrder()

      // Clear committed flag — buffer is preserved for editing
      dispatch({ type: ActionType.CLEAR_COMMITTED })

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] clearCommittedItems: Done, buffer preserved for editing'
        )
      }

      return { success: true }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[OrderProvider] clearCommittedItems error:', error)
      }

      // Best-effort autorefresh recovery
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (cl && state.order?.id) {
          await cl.orders.update({
            id: state.order.id,
            autorefresh: true,
          })
        }
      } catch {
        // Silent recovery
      }

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to clear committed items',
          originalError: error,
        },
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [
    config,
    state.isCommitted,
    state.committedSelectionsHash,
    state.selections,
    state.order,
    fetchOrder,
  ])

  // Compute additional state properties
  const hasValidLicenseSize = !!(state.licenseSize && state.licenseSize.value)
  const hasValidLicenseType = !!(
    state.selectedSkuOptions && state.selectedSkuOptions.length > 0
  )
  const allLicenseInfoSet = !!(
    state.hasLicenseOwner &&
    hasValidLicenseType &&
    hasValidLicenseSize
  )
  const hasLineItems = !!(
    state.order?.line_items && state.order.line_items.length > 0
  )

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    companySizes,
    mediaTypes,
    hasValidLicenseSize,
    hasValidLicenseType,
    allLicenseInfoSet,
    hasLineItems,
    createOrder,
    fetchOrder,
    refetchOrder,
    updateOrder,
    addToCart,
    setLicenseOwner,
    setLicenseSize,
    setLicenseTypes,
    setSelectedSkuOptions,
    deleteLineItem,
    // Selection buffer
    selections: state.selections,
    isCommitted: state.isCommitted,
    toggleStyle,
    toggleGroup,
    setStyleLicenseTypes,
    commitSelections,
    clearCommittedItems,
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
