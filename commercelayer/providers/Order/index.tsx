import { createOrUpdateOrder } from '@/commercelayer/providers/Buy/utils'
import { CLayerClientConfig } from '@/commercelayer/providers/Identity/types'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import { getOrder } from '@/commercelayer/utils/getOrder'
import { LicenseOwner } from '@/components/data/CheckoutProvider'
import {
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from '@/components/data/CheckoutProvider/utils'
import { useOrderContainer } from '@commercelayer/react-components'
import CommerceLayer, {
  LineItem,
  OrderUpdate,
  SkuOption,
  type Order,
} from '@commercelayer/sdk'
import type { ChildrenElement } from 'CustomApp'
import { calculateSettings } from './utils'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'

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

type OrderProviderData = {
  order?: Order
  orderId?: string
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  licenseSize: LicenseSize
  refetchOrder: () => Promise<{
    success: boolean
    order?: Order
  }>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  setLicenseOwner: (params: { licenseOwner?: LicenseOwnerInput }) => void
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  setLicenseTypes: (params: {
    order?: Order
    lineItem: LineItem
    selectedSkuOptions: SkuOption[]
  }) => void
  deleteLineItem: (params: { lineItemId: string }) => void
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => void
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

  const { createOrder } = useOrderContainer()

  // @TODO: reproduce createOrder here from the OrderReducer example

  const fetchOrder = useCallback(async (): Promise<{
    success: boolean
    order?: Order // Assuming Order is your type for order object
  }> => {
    const orderId = localStorage.getItem('order') ?? ''
    const cl = config != null ? getCommerceLayer(config) : undefined
    try {
      if (!orderId || cl == null) {
        return { success: false }
      }

      const orderResponse = await getOrder({ client: cl, orderId })
      const order = orderResponse?.object

      // @NOTE: consider these utils for checking the orderId and order object
      // import { isValidOrderIdFormat } from 'utils/isValidOrderIdFormat'
      // if (!isValidOrderIdFormat(orderId)) {
      // console.log('Invalid: Order Id format')
      // import { isValidStatus } from 'utils/isValidStatus'
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
  }, [config])

  const updateOrder = useCallback(
    async ({
      id,
      attributes,
      include,
    }: UpdateOrderArgs): Promise<{
      success: boolean
      error?: unknown
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
      } catch (error: any) {
        return { success: false, error }
      }
    },
    [config, fetchOrder]
  )

  const fetchSkuOptions = useCallback(async (): Promise<void> => {
    dispatch({ type: ActionType.START_LOADING })
    const cl = config != null ? getCommerceLayer(config) : undefined
    try {
      if (config == null) return
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
    } catch (e) {}
  }, [config])

  const setLicenseOwner = useCallback(
    async (params: { licenseOwner?: LicenseOwnerInput }): Promise<void> => {
      dispatch({ type: ActionType.START_LOADING })
      try {
        if (!params.licenseOwner || !state.orderId) return
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

        updatedOrder &&
          dispatch({
            type: ActionType.SET_LICENSE_OWNER,
            payload: {
              order: updatedOrder,
            },
          })
      } catch (e) {}
    },
    [updateOrder]
  )

  const setLicenseSize = useCallback(
    async (params: { licenseSize?: LicenseSize }): Promise<void> => {
      dispatch({ type: ActionType.START_LOADING })
      // @TODO: dispatch a notifcation to the user that "All your bag items will be adjusted"
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (config == null || !params.licenseSize) return

        await createOrUpdateOrder({
          createOrder,
          updateOrder,
          order: state.order,
          licenseSize: params.licenseSize,
        })
        state.order &&
          (await updateLineItemsLicenseSize({
            cl,
            order: state.order,
            licenseSize: params.licenseSize,
          }))

        const { order } = await fetchOrder()
        order &&
          dispatch({
            type: ActionType.SET_LICENSE_SIZE,
            payload: {
              licenseSize: params.licenseSize,
              order,
            },
          })
      } catch (e) {}
    },
    [config, createOrder, updateOrder, fetchOrder]
  )

  const setLicenseTypes = useCallback(
    async (params: {
      lineItem: LineItem
      selectedSkuOptions: SkuOption[]
    }): Promise<void> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (config == null || !params.lineItem || !params.selectedSkuOptions)
          return

        await updateLineItemLicenseTypes({
          cl,
          selectedSkuOptions: params.selectedSkuOptions,
          lineItem: params.lineItem,
        })
        const { order } = await fetchOrder()
        order &&
          dispatch({
            type: ActionType.SET_LICENSE_TYPES,
            payload: { order },
          })
      } catch (e) {}
    },
    [config, fetchOrder]
  )

  const deleteLineItem = useCallback(
    async (params: { lineItemId: string }) => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (config == null) return
        await cl.line_items.delete(params.lineItemId)
        const { order } = await fetchOrder()
        order &&
          dispatch({
            type: ActionType.DELETE_LINE_ITEM,
            payload: { order },
          })
      } catch (error: any) {
        console.log('deleteLineItem error: ', error)
      }
    },
    [config, fetchOrder]
  )

  const setSelectedSkuOptions = useCallback(
    async (params: {
      selectedSkuOptions: SkuOption[]
      font: any // @TODO font type
    }) => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (
          config == null ||
          !params.font ||
          params.selectedSkuOptions?.length === 0
        ) {
          return
        }

        if (params.selectedSkuOptions && params.selectedSkuOptions.length > 0) {
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
            console.log('lineItemsOfFont: ', lineItemsOfFont)
            for (const lineItem of lineItemsOfFont) {
              await updateLineItemLicenseTypes({
                cl,
                lineItem,
                selectedSkuOptions: params.selectedSkuOptions,
              })
            }
          }
        }
        const { order } = await fetchOrder()
        order &&
          dispatch({
            type: ActionType.SET_LICENSE_TYPES,
            payload: {
              order,
              others: {
                selectedSkuOptions: params.selectedSkuOptions,
              },
            },
          })
      } catch (e) {}
    },
    [
      config,
      fetchOrder, // if this is defined in the same component
    ]
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

  const hasLicenseOwner = state.order?.metadata?.license?.owner
  const licenseOwner = {
    // licenseOwner: state.order?.metadata?.license?.owner.full_name,
    isLicenseForClient: state.order?.metadata?.license?.owner.is_client,
    hasLicenseOwner,
  }

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    ...licenseOwner,
    refetchOrder,
    updateOrder,
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
