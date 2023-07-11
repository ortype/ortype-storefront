import CommerceLayer, {
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'
import { CartSettings, InvalidCartSettings } from 'CustomApp'
import { changeLanguage } from 'i18next'
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'

import { ActionType, reducer } from 'components/data/CartProvider/reducer'
import {
  fetchOrder,
  FetchOrderByIdResponse,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from 'components/data/CheckoutProvider/utils'

import { calculateSettings } from 'components/data/CartProvider/utils'

export type LicenseOwner = {
  full_name?: string | null
}

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

export interface CartProviderData {
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  order: Order
  licenseOwner: LicenseOwner
  licenseSize: LicenseSize
  itemsCount: number
  isLoading: boolean
  orderId: string
  accessToken: string
  slug: string
  domain: string
  isFirstLoading: boolean
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  getOrder: (order: Order) => void
  getOrderFromRef: () => Promise<Order>
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
  deleteLineItem: (params: { order?: Order; lineItemId: string }) => void
  skuOptions: SkuOption[]
}

interface CartProviderProps {
  domain: string
  slug: string
  orderId: string
  accessToken: string
  children?: JSX.Element[] | JSX.Element | null
}

export interface AppStateData {
  order?: Order
  itemsCount: number
  licenseOwner: LicenseOwner
  hasLicenseOwner?: boolean
  licenseSize: LicenseSize
  skuOptions: SkuOption[]
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  order: undefined,
  itemsCount: 0,
  isLoading: true,
  isFirstLoading: true,
  hasLicenseOwner: false,
  licenseOwner: {},
  licenseSize: {},
}

export const CartContext = createContext<CartProviderData | null>(null)

export const useCart = (): CartProviderData => {
  const ctx = useContext(CartContext)
  // console.log('useCart provider: ', ctx, ctx.isLoading, !!ctx.isLoading)
  return {
    ...ctx,
    isLoading: !!ctx.isLoading,
  }
}

export const CartProvider: FC<CartProviderProps> = ({
  accessToken,
  domain,
  slug,
  orderId,
  children,
}) => {
  const orderRef = useRef<Order>()
  const [state, dispatch] = useReducer(reducer, initialState)

  const cl = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  const getOrder = (order: Order) => {
    orderRef.current = order
  }

  const fetchInitialOrder = async (orderId?: string, accessToken?: string) => {
    if (!orderId || !accessToken) {
      return
    }
    dispatch({ type: ActionType.START_LOADING })
    const order = await getOrderFromRef()

    // console.log('fetchInitialOrder settings: ', order)

    const others = calculateSettings(order)

    dispatch({
      type: ActionType.SET_ORDER,
      payload: {
        order,
        others: {
          itemsCount: (order.line_items || []).length,
          ...others,
        },
      },
    })
  }

  // @TODO: follow getOrder/setOrder pattern for sku_options
  const fetchSkuOptions = async () => {
    dispatch({ type: ActionType.START_LOADING })

    const skuOptions = await cl.sku_options.list()
    // console.log('fetchSkuOptions: ', skuOptions)

    dispatch({
      type: ActionType.SET_SKU_OPTIONS,
      payload: {
        skuOptions,
      },
    })
  }

  const setLicenseOwner = async (params: {
    licenseOwner?: LicenseOwner
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    // const currentOrder = params.order ?? (await getOrderFromRef())
    // @TODO: The order returned from `useOrderContainer.updateOrder` doesn't contain line_items
    const currentOrder = await fetchOrder(cl, orderId)
    dispatch({
      type: ActionType.SET_LICENSE_OWNER,
      payload: { licenseOwner: params.licenseOwner, order: currentOrder },
    })
  }

  const setLicenseSize = async (params: {
    licenseSize?: LicenseSize
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    // const currentOrder = params.order ?? (await getOrderFromRef())
    // @TODO: The order returned from `useOrderContainer.updateOrder` doesn't contain line_items
    const currentOrder = await fetchOrder(cl, orderId)
    await updateLineItemsLicenseSize({
      cl,
      order: currentOrder,
      licenseSize: params.licenseSize,
    })
    dispatch({
      type: ActionType.SET_LICENSE_SIZE,
      payload: {
        licenseSize: params.licenseSize,
        order: await fetchOrder(cl, orderId),
      },
    })
  }

  const setLicenseTypes = async (params: {
    lineItem: LineItem
    selectedSkuOptions: SkuOption[]
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())
    await updateLineItemLicenseTypes({
      cl,
      order: currentOrder,
      selectedSkuOptions: params.selectedSkuOptions,
      lineItem: params.lineItem,
    })
    dispatch({
      type: ActionType.SET_LICENSE_TYPES,
      payload: { order: await fetchOrder(cl, orderId) },
    })
  }

  const deleteLineItem = async (params: {
    lineItemId: string
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())
    try {
      await cl.line_items.delete(params.lineItemId)
      dispatch({
        type: ActionType.DELETE_LINE_ITEM,
        payload: { order: await fetchOrder(cl, orderId) },
        // @TODO: maybe need to update `state.itemsCount` here
      })
    } catch (error: any) {
      console.log('deleteLineItem error: ', error)
    }
  }

  const getOrderFromRef = async () => {
    return orderRef.current || (await fetchOrder(cl, orderId))
  }

  useEffect(() => {
    const unsubscribe = () => {
      fetchSkuOptions()
      fetchInitialOrder(orderId, accessToken)
    }
    return unsubscribe()
  }, [orderId, accessToken])

  // @TODO: Why is isLoading false when `order` is undefined

  return (
    <CartContext.Provider
      value={{
        ...state,
        orderId,
        accessToken,
        slug,
        domain,
        getOrderFromRef,
        getOrder,
        setLicenseOwner,
        setLicenseSize,
        setLicenseTypes,
        deleteLineItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
