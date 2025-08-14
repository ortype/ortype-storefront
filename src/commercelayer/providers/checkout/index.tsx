import CommerceLayer, {
  type Address,
  type AddressCreate,
  type AddressUpdate,
  type LineItem,
  type Order,
  type OrderUpdate,
  type PaymentMethod,
  type ShippingMethod as ShippingMethodCollection,
  type SkuOption,
} from '@commercelayer/sdk'
// import { changeLanguage } from "i18next"
import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react'

import { CLayerClientConfig } from '@/commercelayer/providers/Identity/types'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import {
  createBillingAddress as createBillingAddressUtil,
  updateBillingAddress as updateBillingAddressUtil,
  setOrderBillingAddress as attachBillingAddressToOrderUtil,
  type AddressOperationResult,
} from '@/commercelayer/utils/address'
import { ActionType, reducer } from './reducer'
import {
  calculateSettings,
  checkAndSetDefaultAddressForOrder,
  checkIfShipmentRequired,
  fetchOrder,
  fetchPaymentMethods,
  FetchOrderByIdResponse,
  saveCustomerUser as saveCustomerUserUtil,
} from './utils'

type AddressType = 'addresses'

/*
Address {
business?:boolean;
first_name?:string;
last_name?:string;
company?:string;
full_name?:string;
line_1?:string;
line_2?:string;
city?:string;
zip_code?:string;
state_code?:string;
country_code?:string;
phone?:string;
full_address?:string;
name?:string;
email?:string;
notes?:string;
lat?:number;
lng?:number;
is_localized?:boolean;
is_geocoded?:boolean;
provider_name?:string;
map_url?:string;
static_map_url?:string;
billing_info?:string;
geocoder?:Geocoder;
*/

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

export type LicenseOwnerInput = Pick<
  LicenseOwner,
  | 'company'
  | 'is_client'
  | 'full_name'
  | 'first_name'
  | 'last_name'
  | 'line_1'
  | 'line_2'
  | 'city'
  | 'zip_code'
  | 'country_code'
>

interface UpdateOrderArgs {
  id: string
  attributes: Omit<OrderUpdate, 'id'>
  include?: string[]
}

export interface CheckoutProviderData extends FetchOrderByIdResponse {
  isLoading: boolean
  orderId: string
  accessToken: string
  slug: string
  domain: string
  isFirstLoading: boolean
  getOrder: (order: Order) => void
  getOrderFromRef: () => Promise<Order>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
  saveCustomerUser: (customerEmail: string) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
  setCustomerPassword: (password: string) => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
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
  // New address helper methods
  createBillingAddress: (addressData: AddressCreate) => Promise<AddressOperationResult<Address>>
  updateBillingAddress: (addressId: string, addressData: AddressUpdate) => Promise<AddressOperationResult<Address>>
  attachBillingAddressToOrder: (addressId: string, useAsShipping?: boolean) => Promise<AddressOperationResult<Order>>
  // Payment methods helper
  loadPaymentMethods: () => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>
  licenseOwner: LicenseOwner
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  hasCustomer: boolean
  deleteLineItem: (params: { order?: Order; lineItemId: string }) => void
}

export interface AppStateData extends FetchOrderByIdResponse {
  order?: Order
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  order: undefined,
  isLoading: true,
  isFirstLoading: true,
  isGuest: false,
  hasCustomerAddresses: false,
  hasCustomer: false,
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
  licenseOwner: { is_client: false, full_name: '' }, // @TODO: update type def
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

export const useCheckoutContext = () => {
  const context = React.useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckoutContext must be used within a CheckoutProvider')
  }
  return context
}

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

  const cl = isValidCommerceLayerConfig(config)
    ? getCommerceLayer(config)
    : undefined

  // @NOTE: this is exclusively used in the `OrderContainer`` fetchOrder callback
  // the callback updates the the order stored on the ref whenever there are changes
  // @QUESTION: is the order object from the container the same as from utils/fetchOrder
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

  const setAddresses = async (order?: Order) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())
    console.log('setAddresses: currentOrder: ', currentOrder)
    
    // Update the order ref with the current order to keep cache fresh
    orderRef.current = currentOrder
    
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
      try {
        if (cl == null) {
          return { success: false }
        }

        const resource = { ...attributes, id }
        const updatedOrder = await cl.orders.update(resource, { include })
        console.log('updateOrder util: ', updatedOrder)
        const currentOrder = await getOrderFromRef()
        // @WARNING: is this `order` object getting updated by the `getOrder` callback?

        currentOrder &&
          dispatch({
            type: ActionType.UPDATE_ORDER,
            payload: {
              order: currentOrder,
            },
          })

        return { success: true, order: currentOrder }
      } catch (error: any) {
        return { success: false, error }
      }
    },
    [config, fetchOrder]
  )

  const saveCustomerUser = useCallback(
    async (
      customerEmail: string
    ): Promise<{
      success: boolean
      error?: unknown
      order?: Order
    }> => {
      try {
        if (!cl) {
          return { success: false, error: 'CommerceLayer client not available' }
        }

        const result = await saveCustomerUserUtil({
          cl,
          orderId,
          customerEmail,
        })

        dispatch({
          type: ActionType.SET_CUSTOMER_EMAIL,
          payload: { customerEmail },
        })

        return result
      } catch (error) {
        return { success: false, error }
      }
    },
    [cl, orderId, dispatch]
  )

  const setCustomerPassword = useCallback(
    async (
      password: string
    ): Promise<{
      success: boolean
      error?: unknown
      order?: Order
    }> => {
      try {
        if (!cl) {
          return { success: false, error: 'CommerceLayer client not available' }
        }

        // Use Commerce Layer's shortcut to sign up the associated customer
        // by setting customer_password attribute on the order
        const result = await updateOrder({
          id: orderId,
          attributes: {
            customer_password: password,
          },
          include: ['customer'],
        })

        if (result.success && result.order) {
          return { success: true, order: result.order }
        }

        return result
      } catch (error) {
        return { success: false, error }
      }
    },
    [cl, orderId, updateOrder]
  )

  const setLicenseOwner = async (params: {
    licenseOwner?: LicenseOwnerInput
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())
    dispatch({
      type: ActionType.SET_LICENSE_OWNER,
      payload: { licenseOwner: params.licenseOwner, order: currentOrder },
    })
  }

  const getOrderFromRef = async () => {
    return orderRef.current || (await fetchOrder(cl, orderId))
  }

  // New address helper methods that call utils layer
  const createBillingAddress = useCallback(
    async (addressData: AddressCreate): Promise<AddressOperationResult<Address>> => {
      if (!cl) {
        return {
          success: false,
          error: {
            errors: [
              {
                title: 'Missing Commerce Layer client',
                detail: 'Commerce Layer client is required',
                code: 'MISSING_CLIENT',
              },
            ],
          },
        }
      }
      
      return await createBillingAddressUtil({ cl, addressData })
    },
    [cl]
  )

  const updateBillingAddress = useCallback(
    async (
      addressId: string,
      addressData: AddressUpdate
    ): Promise<AddressOperationResult<Address>> => {
      if (!cl) {
        return {
          success: false,
          error: {
            errors: [
              {
                title: 'Missing Commerce Layer client',
                detail: 'Commerce Layer client is required',
                code: 'MISSING_CLIENT',
              },
            ],
          },
        }
      }
      
      return await updateBillingAddressUtil({ cl, addressId, addressData })
    },
    [cl]
  )

  const attachBillingAddressToOrder = useCallback(
    async (
      addressId: string,
      useAsShipping: boolean = false
    ): Promise<AddressOperationResult<Order>> => {
      if (!cl) {
        return {
          success: false,
          error: {
            errors: [
              {
                title: 'Missing Commerce Layer client',
                detail: 'Commerce Layer client is required',
                code: 'MISSING_CLIENT',
              },
            ],
          },
        }
      }
      
      const result = await attachBillingAddressToOrderUtil({
        cl,
        orderId,
        addressId,
        useAsShipping,
      })
      
      // If successful, refresh the order state using setAddresses
      if (result.success && result.data) {
        await setAddresses(result.data)
      }
      
      return result
    },
    [cl, orderId]
  )

  // Payment methods helper method
  const loadPaymentMethods = useCallback(
    async (): Promise<{
      success: boolean
      error?: unknown
      order?: Order
    }> => {
      try {
        if (!cl) {
          return { success: false, error: 'CommerceLayer client not available' }
        }

        const result = await fetchPaymentMethods({ cl, orderId })
        
        if (result.success && result.order) {
          // Merge payment methods data with existing order data
          const currentOrder = await getOrderFromRef()
          const mergedOrder = {
            ...currentOrder, // Keep existing order data
            ...result.order, // Overlay payment methods data
            // Ensure we preserve specific fields that might be newer in currentOrder
            id: currentOrder.id,
            status: result.order.status || currentOrder.status,
          }
          
          // Update the order ref with merged data
          orderRef.current = mergedOrder
          
          // Update the provider state with the merged order data
          const others = calculateSettings(
            mergedOrder,
            state.isShipmentRequired,
            state.customerAddresses
          )
          
          dispatch({
            type: ActionType.UPDATE_ORDER,
            payload: {
              order: mergedOrder,
              others,
            },
          })
        }
        
        return result
      } catch (error) {
        return { success: false, error }
      }
    },
    [cl, orderId, state.isShipmentRequired, state.customerAddresses]
  )

  useEffect(() => {
    fetchInitialOrder(orderId, accessToken)
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
        updateOrder,
        getOrder,
        saveShipments,
        setPayment,
        setCouponOrGiftCard,
        placeOrder,
        saveCustomerUser,
        setCustomerPassword,
        autoSelectShippingMethod,
        setLicenseOwner,
        // New address helper methods
        createBillingAddress,
        updateBillingAddress,
        attachBillingAddressToOrder,
        // Payment methods helper
        loadPaymentMethods,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
