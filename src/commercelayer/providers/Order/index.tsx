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
  licenseOwner: LicenseOwnerInput
  hasLicenseOwner?: boolean
  isLicenseForClient?: boolean
  licenseSize: LicenseSize
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  hasLicenseOwner: false,
  licenseOwner: { is_client: false, full_name: '' },
  licenseSize: {},
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

  // @NOTE: possbily interesting to repurpose this accessTokenSync from useCartSettingsOrInvalid
  // this bit checks the orderId in localStorage and updates it if not synced
  // import { useLocalStorage } from 'usehooks-ts'
  // import { useLocalStorageToken } from '@/commercelayer/hooks/useLocalStorage'
  /*
  const [savedOrderId, setOrderId] = useLocalStorageToken(
    'order',
    orderId as string
  )

  useEffect(() => {
    if (orderId && orderId !== savedOrderId) {
      setOrderId(orderId)
    }
  }, [orderId])
  
  const syncedOrderId =
    orderId === savedOrderId || (!orderId && savedOrderId)
  
  */

  // @TODO: setup createOrder call here
  // we need to setup the signature differently then the example so that it matches our Provider/Reducer/Util structure

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
          ...metadata,
          ...params?.customMetadata,
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
      // @TODO: use this sytnax
      // `const localOrder = persistKey ? getLocalOrder(persistKey) : orderId`
      const orderId = params?.orderId ?? localStorage.getItem('order')
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!orderId || cl == null) {
          return { success: false }
        }
        console.log('fetchOrder: ', orderId)
        const orderResponse = await getOrder({ client: cl, orderId })
        const order = orderResponse?.object

        // @NOTE: on initial createOrder, and subsequently calling `fetchOrder` this order response has no metadata

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
    [config]
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

  const fetchSkuOptions = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    dispatch({ type: ActionType.START_LOADING })
    const cl = config != null ? getCommerceLayer(config) : undefined
    try {
      if (config == null) {
        throw new Error('Commerce Layer client not initialized')
      }

      const skuOptions = await cl.sku_options.list()
      // @TODO: maybe we need to select the sku_options on initial load from the line_items of this font
      // but this could get confusing if you already have items in the cart from that font
      // Dinamo presents the license size as the first step in the buy process and has no default selection

      dispatch({
        type: ActionType.SET_SKU_OPTIONS,
        payload: {
          skuOptions,
          others: {
            // initial license type setting
            selectedSkuOptions: [skuOptions[0]],
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
  }, [config])

  const setLicenseOwner = useCallback(
    async (params: {
      licenseOwner?: LicenseOwnerInput
    }): Promise<{
      success: boolean
      error?: AddToCartError
      order?: Order
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      try {
        if (!params.licenseOwner || !state.orderId) {
          throw new Error('Missing license owner or order ID')
        }

        const { order: updatedOrder } = await updateOrder({
          id: state.orderId,
          attributes: {
            metadata: {
              license: {
                ...state.order?.metadata?.license,
                owner: params.licenseOwner,
              },
            },
          },
        })

        if (!updatedOrder) {
          throw new Error('Failed to update order with license owner')
        }

        dispatch({
          type: ActionType.SET_LICENSE_OWNER,
          payload: {
            order: updatedOrder,
          },
        })

        return { success: true, order: updatedOrder }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting license owner:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to set license owner',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [updateOrder, state.orderId, state.order]
  )

  /*
  addToCart: async (
    params: Parameters<typeof addToCart>[number],
  ): ReturnType<typeof addToCart> =>
    await addToCart({
      ...params,
      persistKey,
      dispatch,
      state,
      config,
      errors: state.errors,
      orderMetadata: metadata || {},
      orderAttributes: attributes,
      setLocalOrder,
    }),
  */

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

        if (process.env.NODE_ENV !== 'production') {
          console.log('OrderProvider.setLicenseSize: ', params.licenseSize)
        }

        const orderId = await createOrUpdateOrder({
          createOrder,
          updateOrder,
          order: state.order,
          licenseSize: params.licenseSize,
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

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting license size:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to set license size',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, createOrder, updateOrder, fetchOrder, state.order]
  )

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
      try {
        if (config == null || !params.lineItem || !params.selectedSkuOptions) {
          throw new Error(
            'Commerce Layer client not initialized or missing required parameters'
          )
        }

        await updateLineItemLicenseTypes({
          cl,
          selectedSkuOptions: params.selectedSkuOptions,
          lineItem: params.lineItem,
        })

        const { order } = await fetchOrder()

        if (!order) {
          throw new Error(
            'Failed to fetch updated order after setting license types'
          )
        }

        dispatch({
          type: ActionType.SET_LICENSE_TYPES,
          payload: { order },
        })

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting license types:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to set license types',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, fetchOrder]
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
      try {
        if (
          config == null ||
          !params.font ||
          params.selectedSkuOptions?.length === 0
        ) {
          throw new Error(
            'Missing required parameters or Commerce Layer client not initialized'
          )
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

        const { order } = await fetchOrder()

        if (!order) {
          throw new Error(
            'Failed to fetch updated order after setting selected SKU options'
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

        return { success: true, order }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error setting selected SKU options:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to set selected SKU options',
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

  useEffect(() => {
    dispatch({ type: ActionType.START_LOADING })
    const unsubscribe = () => {
      if (config.accessToken) {
        fetchSkuOptions()
        fetchOrder()
      }
    }
    return unsubscribe()
  }, [config.accessToken, fetchOrder, fetchSkuOptions])

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    // ...calculateSettings({order}), // @NOTE: since we may not have an order
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
