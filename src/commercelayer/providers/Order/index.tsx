import { CLayerClientConfig } from '@/commercelayer/providers/Identity/types'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import utils, {
  calculateSettings,
  createOrUpdateOrder,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from '@/commercelayer/providers/Order/utils'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import { getOrder } from '@/commercelayer/utils/getOrder'
import { LicenseOwner } from '@/components/data/CheckoutProvider'
import {
  LineItem,
  OrderUpdate,
  SkuOption,
  type Order,
} from '@commercelayer/sdk'
import type { ChildrenElement } from 'CustomApp'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { OrderStorageContext } from './Storage'
import { toaster } from '@/components/ui/toaster'

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

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

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
      const cl = config != null ? getCommerceLayer(config) : undefined

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
          console.log('createOrder: mergedMetadata:', {
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
          console.log('fetchOrder: ', orderId)
        }
        const orderResponse = await getOrder({ client: cl, orderId })
        const order = orderResponse?.object

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
    [config, persistKey, getLocalOrder]
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

  const fetchSkuOptions = useCallback(async (existingTypes: string[] = []): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    dispatch({ type: ActionType.START_LOADING })
    const cl = config != null ? getCommerceLayer(config) : undefined
    try {
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      const skuOptions = await cl.sku_options.list()
      
      // Use passed existingTypes parameter instead of accessing state directly
      // This breaks the circular dependency
      
      // Find matching sku options for existing types
      const existingSelectedOptions = skuOptions.filter(option => 
        existingTypes.includes(option.reference)
      )

      if (process.env.NODE_ENV !== 'production') {
        console.log('🎯 fetchSkuOptions: Processing types and options:', {
          existingTypes,
          matchingOptions: existingSelectedOptions.map(opt => ({ id: opt.id, name: opt.name, reference: opt.reference })),
          allOptionsCount: skuOptions.length,
          allOptionsReferences: skuOptions.map(opt => opt.reference)
        })
      }

      dispatch({
        type: ActionType.SET_SKU_OPTIONS,
        payload: {
          skuOptions,
          others: {
            selectedSkuOptions: existingSelectedOptions,
            hasValidLicenseType: existingSelectedOptions.length > 0
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
  }, [config]) // Only depend on config, not on state

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
        console.log('setLicenseOwner: Starting with params:', {
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
        const operationName = 'Set license owner';

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
          console.log('setLicenseOwner: fetchOrder result:', {
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
          console.log('setLicenseOwner: Order metadata:', {
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
        toaster.create({
          title: 'License owner updated successfully',
          type: 'success',
          duration: 2000,
        })

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
        const errorMessage = error instanceof Error ? error.message : 'Failed to set license owner';
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

        const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
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
        const operationName = 'Set license size';

        if (process.env.NODE_ENV !== 'production') {
          console.log('OrderProvider.setLicenseSize: ', params.licenseSize)
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
        toaster.create({
          title: 'License size updated successfully',
          type: 'success',
          duration: 2000,
        })

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting license size:', error)
        }

        // Show error notification
        const errorMessage = error instanceof Error ? error.message : 'Failed to set license size';
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
        console.log('setLicenseTypes: Starting with params:', {
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
        const operationName = 'Set license types';
        if (process.env.NODE_ENV !== 'production') {
          console.log('setLicenseTypes: Updating line item license types')
        }

        await updateLineItemLicenseTypes({
          cl,
          selectedSkuOptions: params.selectedSkuOptions,
          lineItem: params.lineItem,
        })

        const { order, success } = await fetchOrder({ orderId: state.orderId })

        if (process.env.NODE_ENV !== 'production') {
          console.log('setLicenseTypes: fetchOrder result:', {
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
        toaster.create({
          title: 'License types updated successfully',
          type: 'success',
          duration: 2000,
        })

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
        const errorMessage = error instanceof Error ? error.message : 'Failed to set license types';
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

        await cl.line_items.delete(params.lineItemId)
        const { order } = await fetchOrder()

        if (!order) {
          throw new Error(
            'Failed to fetch updated order after deleting line item'
          )
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
    [config, fetchOrder]
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
        console.log('setSelectedSkuOptions: Starting with params:', {
          hasOrder: !!state.order,
          orderId: state.orderId,
          font: params.font?.shortName,
          selectedSkuOptions: params.selectedSkuOptions,
          currentOrderMetadata: state.order?.metadata
        })
      }
      
      try {
        // Improved validation with specific error messages
        if (config == null) {
          throw new Error('Commerce Layer client not initialized')
        }
        
        if (!params.font) {
          throw new Error('Font information is required')
        }
        
        if (!params.selectedSkuOptions || params.selectedSkuOptions.length === 0) {
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
              selectedTypes: params.selectedSkuOptions.map(opt => opt.reference),
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
            console.log('lineItemsOfFont: ', lineItemsOfFont)
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
          console.log('setSelectedSkuOptions: fetchOrder result:', {
            success,
            hasOrder: !!order,
            updatedMetadata: order?.metadata?.license
          })
        }

        if (!success || !order) {
          throw new Error(
            'Failed to fetch updated order after setting selected SKU options'
          )
        }

        // Validate that license types were properly set in metadata
        const updatedTypes = order.metadata?.license?.types
        if (!updatedTypes || !Array.isArray(updatedTypes) || updatedTypes.length === 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('License types may not have been properly persisted:', {
              licenseMetadata: order.metadata?.license,
              expectedTypes: params.selectedSkuOptions.map(option => option.reference)
            })
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
              hasValidLicenseType: params.selectedSkuOptions.length > 0
            },
          },
        })

        // Show success notification
        toaster.create({
          title: 'License types updated successfully',
          type: 'success',
          duration: 2000,
        })

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error in setSelectedSkuOptions:', {
            errorMessage: error instanceof Error ? error.message : String(error),
            stateInfo: {
              hasOrder: !!state.order,
              orderId: state.orderId,
              hasLineItems: !!(state.order?.line_items && state.order.line_items.length > 0),
              currentOrderMetadata: state.order?.metadata
            },
          })
        }

        // Show error notification
        const errorMessage = error instanceof Error ? error.message : 'Failed to set license types';
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
    if (!config.accessToken) return;
    
    dispatch({ type: ActionType.START_LOADING })
    try {
      // Sequential initialization
      const { order, success } = await fetchOrder()
      
      // Always fetch SKU options, passing existing license types if order exists
      let existingTypes: string[] = []
      
      if (success && order) {
        // If order is found, use its license types
        existingTypes = order.metadata?.license?.types || []
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔄 initializeProvider: Found existing order with types:', {
            orderId: order.id,
            existingTypes,
            fullMetadata: order.metadata,
            licenseMetadata: order.metadata?.license
          })
        }
      } else {
        // If no order is found, use empty array
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔄 initializeProvider: No existing order found, using empty types array', {
            success,
            hasOrder: !!order
          })
        }
      }
      
      const result = await fetchSkuOptions(existingTypes)
      
      if (!result.success) {
        console.warn('Failed to fetch SKU options during initialization')
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('✅ initializeProvider: Successfully fetched SKU options')
        }
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

  // Compute additional state properties
  const hasValidLicenseSize = !!(state.licenseSize && state.licenseSize.value)
  const hasValidLicenseType = !!(state.selectedSkuOptions && state.selectedSkuOptions.length > 0)
  const allLicenseInfoSet = !!(state.hasLicenseOwner && hasValidLicenseType && hasValidLicenseSize)
  const hasLineItems = !!(state.order?.line_items && state.order.line_items.length > 0)

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
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
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
