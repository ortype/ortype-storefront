import { getOrder } from '@/commercelayer/utils/getOrder'
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

export type LicenseOwner = {
  full_name?: string | null
}

type OrderProviderData = {
  order?: Order
  orderId?: string
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  licenseSize: LicenseSize
  refetchOrder: () => Promise<void>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  setLicenseOwner: (params: {
    order?: Order
    licenseOwner?: LicenseOwner
  }) => void
  setLicenseSize: (params: { order?: Order; licenseSize?: LicenseSize }) => void
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
  licenseOwner: LicenseOwner
  hasLicenseOwner?: boolean
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
  licenseOwner: {},
  licenseSize: {},
  selectedSkuOptions: [],
  skuOptions: [],
  itemsCount: 0,
  isLoading: true,
  isInvalid: false,
}

import { createOrUpdateOrder } from '@/commercelayer/providers/Buy/utils'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import { LicenseOwner } from '@/components/data/CheckoutProvider'
import {
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from '@/components/data/CheckoutProvider/utils'
import { useOrderContainer } from '@commercelayer/react-components'

const OrderContext = createContext<OrderProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as OrderProviderData
)

export const useOrderContext = (): OrderProviderData => useContext(OrderContext)

type OrderProviderProps = {
  accessToken: string
  domain: string
  slug: string
  children: ((props: OrderProviderData) => ChildrenElement) | ChildrenElement
}

export function OrderProvider({
  children,
  accessToken,
  domain,
  slug,
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

  async function updateOrder({
    id,
    attributes,
    include,
  }: UpdateOrderArgs): Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }> {
    // @TODO: consider react-components getSdk pattern
    // const sdk = config != null ? getSdk(config) : undefined
    try {
      if (!accessToken) {
        return { success: false }
      }

      const cl = CommerceLayer({
        organization: slug,
        accessToken,
        domain,
      })

      const resource = { ...attributes, id }

      await cl.orders.update(resource, { include })
      const order = await fetchOrder(accessToken)

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
  }

  const fetchOrder = useCallback(async (accessToken?: string) => {
    const orderId = localStorage.getItem('order') ?? ''
    if (!orderId || !accessToken) {
      return
    }

    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    const orderResponse = await getOrder({ client: cl, orderId })
    const order = orderResponse?.object

    const others = calculateSettings(order)

    // @NOTE: consider these utils for checking the orderId and order object
    // import { isValidOrderIdFormat } from 'utils/isValidOrderIdFormat'
    // if (!isValidOrderIdFormat(orderId)) {
    // console.log('Invalid: Order Id format')
    // import { isValidStatus } from 'utils/isValidStatus'
    // if (!isValidStatus(order.status)) {
    // console.log('Invalid: Order status')

    dispatch({
      type: ActionType.SET_ORDER,
      payload: {
        order,
        others: {
          itemsCount: (order?.line_items || []).length,
          isInvalid: !order,
          orderId,
          ...others,
        },
      },
    })
    return order
  }, [])

  // @TODO: useCallback() with deps if needed
  const fetchSkuOptions = async () => {
    dispatch({ type: ActionType.START_LOADING })

    if (!accessToken) {
      return
    }
    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

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
  }

  // @TODO: useCallback() with deps if needed
  const setLicenseOwner = async (params: {
    licenseOwner?: LicenseOwner
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    dispatch({
      type: ActionType.SET_LICENSE_OWNER,
      payload: { licenseOwner: params.licenseOwner, order: state.order },
    })
  }

  // @TODO: useCallback() with deps if needed
  const setLicenseSize = async (params: { licenseSize?: LicenseSize }) => {
    dispatch({ type: ActionType.START_LOADING })
    // @TODO: dispatch a notifcation to the user that "All your bag items will be adjusted"
    if (!accessToken) {
      return
    }
    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    await createOrUpdateOrder({
      createOrder,
      updateOrder,
      order: state.order,
      licenseSize: params.licenseSize,
    })
    await updateLineItemsLicenseSize({
      cl,
      order: state.order,
      licenseSize: params.licenseSize,
    })

    dispatch({
      type: ActionType.SET_LICENSE_SIZE,
      payload: {
        licenseSize: params.licenseSize,
        order: await fetchOrder(accessToken),
      },
    })
  }

  // @TODO: useCallback() with deps if needed
  const setLicenseTypes = async (params: {
    lineItem: LineItem
    selectedSkuOptions: SkuOption[]
  }) => {
    dispatch({ type: ActionType.START_LOADING })

    if (!accessToken) {
      return
    }
    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    await updateLineItemLicenseTypes({
      cl,
      order: state.order,
      selectedSkuOptions: params.selectedSkuOptions,
      lineItem: params.lineItem,
    })
    dispatch({
      type: ActionType.SET_LICENSE_TYPES,
      payload: { order: await fetchOrder(accessToken) },
    })
  }

  // @TODO: useCallback() with deps if needed
  const deleteLineItem = async (params: { lineItemId: string }) => {
    dispatch({ type: ActionType.START_LOADING })

    if (!accessToken) {
      return
    }
    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    try {
      await cl.line_items.delete(params.lineItemId)
      dispatch({
        type: ActionType.DELETE_LINE_ITEM,
        payload: { order: await fetchOrder(accessToken) },
        // @TODO: maybe need to update `state.itemsCount` here
      })
    } catch (error: any) {
      console.log('deleteLineItem error: ', error)
    }
  }

  // @TODO: useCallback() with deps if needed
  const setSelectedSkuOptions = async (params: {
    selectedSkuOptions: SkuOption[]
    font: any // @TODO font type
  }) => {
    dispatch({ type: ActionType.START_LOADING })

    if (!params.font || params.selectedSkuOptions?.length === 0) {
      return
    }

    if (!accessToken) {
      return
    }
    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    console.log('params.selectedSkuOptions: ', params.selectedSkuOptions)
    if (params.selectedSkuOptions && params.selectedSkuOptions.length > 0) {
      // When you change the License Size in Dinamo buy page, a notification appears
      // stating all items will be updated and confirms that choice. When you change the global
      // license type, they show an inline notification on that SKU item.

      // @TODO: Trigger notifcation stating that all items in the Cart for this font will be updated
      // Alternatively: add a inline notification to skus that have already been added to the cart,
      // with a calculated price based on that line_items skuOptions

      if (state.order?.line_items?.length > 0) {
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

    dispatch({
      type: ActionType.SET_LICENSE_TYPES,
      payload: {
        order: await fetchOrder(accessToken),
        others: {
          selectedSkuOptions: params.selectedSkuOptions,
        },
      },
    })
  }

  useEffect(() => {
    dispatch({ type: ActionType.START_LOADING })
    const unsubscribe = () => {
      fetchSkuOptions()
      fetchOrder(accessToken)
    }
    return unsubscribe()
  }, [accessToken, fetchOrder])

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    refetchOrder: async () => {
      return await fetchOrder(accessToken)
    },
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
