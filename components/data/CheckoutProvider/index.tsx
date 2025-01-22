import CommerceLayer, {
  type LineItem,
  type Order,
  type PaymentMethod,
  type ShippingMethod as ShippingMethodCollection,
  type SkuOption,
} from '@commercelayer/sdk'
// import { changeLanguage } from "i18next"
import { createContext, useEffect, useReducer, useRef } from 'react'

import { CLayerClientConfig } from '@/commercelayer/providers/Identity/types'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import { ActionType, reducer } from 'components/data/CheckoutProvider/reducer'
import {
  calculateSettings,
  checkAndSetDefaultAddressForOrder,
  checkIfShipmentRequired,
  fetchOrder,
  FetchOrderByIdResponse,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from 'components/data/CheckoutProvider/utils'

type AddressType = 'addresses'
export type LicenseOwner = {
  readonly type: AddressType
  is_client: boolean | null
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  company?: string | null
  line_1: string
  line_2?: string | null
  city: string
  zip_code?: string | null
  state_code: string
  country_code: string
  full_address?: string | null
  name?: string | null
  email?: string | null
}

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

export interface CheckoutProviderData extends FetchOrderByIdResponse {
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
  setCustomerEmail: (email: string) => void
  setAddresses: (order?: Order) => Promise<void>
  setCouponOrGiftCard: () => Promise<void>
  saveShipments: () => void
  placeOrder: (order?: Order) => Promise<void>
  setPayment: (params: { payment?: PaymentMethod; order?: Order }) => void
  selectShipment: (params: {
    shippingMethod: {
      id: string
    }
    shipmentId: string
    order?: Order
  }) => Promise<void>
  autoSelectShippingMethod: (order?: Order) => Promise<void>
  setLicenseOwner: (params: {
    order?: Order
    licenseOwner?: LicenseOwner
  }) => void
  setLicenseTypes: (params: {
    order?: Order
    lineItem: LineItem
    selectedSkuOptions: SkuOption[]
  }) => void
  deleteLineItem: (params: { order?: Order; lineItemId: string }) => void
  skuOptions: SkuOption[]
}

export interface AppStateData extends FetchOrderByIdResponse {
  order?: Order
  skuOptions: SkuOption[]
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  order: undefined,
  isLoading: true,
  isFirstLoading: true,
  isGuest: false,
  hasCustomerAddresses: false,
  isUsingNewBillingAddress: true,
  isUsingNewShippingAddress: true,
  hasSameAddresses: false,
  hasEmailAddress: false,
  emailAddress: '',
  hasBillingAddress: false,
  billingAddress: undefined,
  requiresBillingInfo: false,
  isShipmentRequired: false,
  shippingAddress: undefined,
  hasShippingMethod: false,
  hasShippingAddress: false,
  hasLicenseOwner: false,
  isLicenseForClient: false,
  licenseOwner: {},
  licenseSize: {},
  shipments: [],
  customerAddresses: [],
  paymentMethod: undefined,
  hasPaymentMethod: false,
  isPaymentRequired: true,
  isCreditCard: false,
  shippingCountryCodeLock: '',
  isComplete: false,
  returnUrl: '',
  cartUrl: undefined,
  taxIncluded: false,
  shippingMethodName: undefined,
}

export const CheckoutContext = createContext<CheckoutProviderData | null>(null)

interface CheckoutProviderProps {
  config: CLayerClientConfig
  orderId: string
  children?: JSX.Element[] | JSX.Element | null
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
  orderId,
  config,
}) => {
  const orderRef = useRef<Order>()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { accessToken } = config

  const cl = config != null ? getCommerceLayer(config) : undefined

  const getOrder = (order: Order) => {
    orderRef.current = order
  }

  const fetchInitialOrder = async (orderId?: string, accessToken?: string) => {
    if (!orderId || !accessToken) {
      return
    }
    dispatch({ type: ActionType.START_LOADING })
    const order = await getOrderFromRef()
    const isShipmentRequired = await checkIfShipmentRequired(cl, orderId)

    const addressInfos = await checkAndSetDefaultAddressForOrder({
      cl,
      order,
    })

    const others = calculateSettings(order, isShipmentRequired)

    console.log('fetchInitialOrder settings: ', others)

    dispatch({
      type: ActionType.SET_ORDER,
      payload: {
        order,
        others: {
          isShipmentRequired,
          ...others,
          ...addressInfos,
        },
      },
    })

    // await changeLanguage(order.language_code)
  }

  // @TODO: follow getOrder/setOrder pattern for sku_options
  const fetchSkuOptions = async () => {
    dispatch({ type: ActionType.START_LOADING })

    const skuOptions = await cl.sku_options.list()
    console.log('fetchSkuOptions: ', skuOptions)

    dispatch({
      type: ActionType.SET_SKU_OPTIONS,
      payload: {
        skuOptions,
      },
    })
  }

  const setCustomerEmail = (email: string) => {
    dispatch({
      type: ActionType.SET_CUSTOMER_EMAIL,
      payload: { customerEmail: email },
    })
  }

  const setAddresses = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())
    console.log(currentOrder)
    const isShipmentRequired = await checkIfShipmentRequired(cl, orderId)

    const others = calculateSettings(
      currentOrder,
      isShipmentRequired,
      // FIX We are using customer addresses saved in reducer because
      // we don't receive them from fetchOrder
      state.customerAddresses
    )
    setTimeout(() => {
      dispatch({
        type: ActionType.SET_ADDRESSES,
        payload: {
          order: currentOrder,
          others,
        },
      })
    }, 100)
  }

  const setCouponOrGiftCard = async (order?: Order) => {
    const currentOrder = order ?? (await getOrderFromRef())
    if (state.order) {
      dispatch({ type: ActionType.START_LOADING })

      const others = calculateSettings(
        currentOrder,
        state.isShipmentRequired,
        state.customerAddresses
      )
      setTimeout(() => {
        dispatch({
          type: ActionType.CHANGE_COUPON_OR_GIFTCARD,
          payload: { order: currentOrder, others },
        })
      }, 100)
    }
  }

  const selectShipment = async (params: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shippingMethod: ShippingMethodCollection | Record<string, any>
    shipmentId: string
    order?: Order
  }) => {
    // dispatch({ type: ActionType.START_LOADING })
    // TODO Remove after fixing components
    const currentOrder = params.order ?? (await fetchOrder(cl, orderId))

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      state.customerAddresses
    )

    dispatch({
      type: ActionType.SELECT_SHIPMENT,
      payload: {
        order: currentOrder,
        others,
        shipment: {
          shippingMethod: params.shippingMethod,
          shipmentId: params.shipmentId,
        },
      },
    })
  }

  const autoSelectShippingMethod = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await fetchOrder(cl, orderId))

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      state.customerAddresses
    )
    setTimeout(() => {
      dispatch({
        type: ActionType.SAVE_SHIPMENTS,
        payload: { order: currentOrder, others },
      })
    }, 100)
  }

  const saveShipments = async () => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = await getOrderFromRef()
    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      state.customerAddresses
    )

    setTimeout(() => {
      dispatch({
        type: ActionType.SAVE_SHIPMENTS,
        payload: { order: currentOrder, others },
      })
    }, 100)
  }

  const setPayment = async (params: {
    payment?: PaymentMethod
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())

    const others = calculateSettings(
      currentOrder,
      state.isShipmentRequired,
      state.customerAddresses
    )

    dispatch({
      type: ActionType.SET_PAYMENT,
      payload: { payment: params.order, order: currentOrder, others },
    })
  }

  const placeOrder = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())

    dispatch({
      type: ActionType.PLACE_ORDER,
      payload: { order: currentOrder },
    })
  }

  const setLicenseOwner = async (params: {
    licenseOwner?: LicenseOwner
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())
    dispatch({
      type: ActionType.SET_LICENSE_OWNER,
      payload: { licenseOwner: params.licenseOwner, order: currentOrder },
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

  // @TODO: Delete line_item

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

  return (
    <CheckoutContext.Provider
      value={{
        ...state,
        orderId,
        ...config,
        getOrderFromRef,
        setAddresses,
        selectShipment,
        getOrder,
        saveShipments,
        setPayment,
        setCouponOrGiftCard,
        placeOrder,
        setCustomerEmail,
        autoSelectShippingMethod,
        setLicenseOwner,
        setLicenseTypes,
        deleteLineItem,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
