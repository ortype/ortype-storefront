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
  useContext,
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
  validateAddress,
  type AddressOperationResult,
} from '@/commercelayer/utils/address'
import { type AddressInput } from '@/commercelayer/providers/address'
import { OrderStorageContext } from '@/commercelayer/providers/Order/Storage'
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
  hasLineItems: boolean
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
  createBillingAddress: (
    addressData: AddressCreate
  ) => Promise<AddressOperationResult<Address>>
  updateBillingAddress: (
    addressId: string,
    addressData: AddressUpdate
  ) => Promise<AddressOperationResult<Address>>
  attachBillingAddressToOrder: (
    addressId: string,
    useAsShipping?: boolean
  ) => Promise<AddressOperationResult<Order>>
  // Payment methods helper
  loadPaymentMethods: () => Promise<{
    success: boolean
    error?: unknown
    order?: Order
  }>

  // Enhanced save method for address (orchestrates multiple steps)
  saveAddress: (
    addressData: AddressInput,
    useAsShipping?: boolean
  ) => Promise<{ success: boolean; error?: string; order?: Order }>

  // Enhanced save method for license owner (orchestrates multiple steps)
  saveLicenseOwner: (
    formData: LicenseOwnerInput,
    isForClient: boolean
  ) => Promise<{ success: boolean; error?: string; order?: Order }>

  // Payment submission registry
  registerPaymentSubmitter: (submitter: () => Promise<boolean>) => void
  submitRegisteredPayment: () => Promise<boolean>

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
  hasLineItems: boolean
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
  hasLineItems: false,
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
  
  // Payment submission registry
  const paymentSubmitterRef = useRef<(() => Promise<boolean>) | null>(null)

  // Get OrderStorage context for localStorage clearing functionality
  const orderStorageContext = useContext(OrderStorageContext)

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
    const currentOrder = params.order ?? (await fetchOrder(cl, orderId, {
      clearWhenPlaced: orderStorageContext.clearWhenPlaced,
      persistKey: orderStorageContext.persistKey,
      deleteLocalOrder: orderStorageContext.deleteLocalOrder,
    }))

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
    const currentOrder = order ?? (await fetchOrder(cl, orderId, {
      clearWhenPlaced: orderStorageContext.clearWhenPlaced,
      persistKey: orderStorageContext.persistKey,
      deleteLocalOrder: orderStorageContext.deleteLocalOrder,
    }))

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
    console.log('setPayment called in CheckoutProvider with:', params)
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())

    let updatedOrder = currentOrder

    // If we have a payment method selected, set it on the order and create payment source
    if (params.payment && cl) {
      try {
        console.log(
          'Setting payment method on order:',
          params.payment.payment_source_type
        )

        // Step 1: Set the payment method on the order
        updatedOrder = await cl.orders.update(
          {
            id: orderId,
            payment_method: cl.payment_methods.relationship(params.payment.id),
          },
          {
            include: [
              'payment_source',
              'payment_method',
              'available_payment_methods',
            ],
          }
        )

        console.log('Updated order with payment method:', updatedOrder)

        // Step 2: Create payment source (following Commerce Layer pattern)
        const paymentResource = params.payment.payment_source_type
        let paymentSource: any

        // Prepare attributes based on payment type (following their pattern)
        let attributes: Record<string, unknown> = {}

        if (paymentResource === 'stripe_payments') {
          // Add return_url for Stripe (as in their StripeGateway)
          attributes = {
            return_url: window.location.href,
          }
        }

        console.log('Creating payment source with attributes:', attributes)

        // Create payment source with order relationship
        paymentSource = await cl[paymentResource].create({
          ...attributes,
          order: cl.orders.relationship(orderId),
        })

        console.log('Created payment source:', paymentSource)

        // Step 3: Refresh order to get the updated payment source
        updatedOrder = await fetchOrder(cl, orderId, {
          clearWhenPlaced: orderStorageContext.clearWhenPlaced,
          persistKey: orderStorageContext.persistKey,
          deleteLocalOrder: orderStorageContext.deleteLocalOrder,
        })

        console.log('Final updated order with payment source:', updatedOrder)

        // Update the order ref
        orderRef.current = updatedOrder
      } catch (error) {
        console.error(
          'Error setting payment method or creating payment source:',
          error
        )
        // Continue with the original order if payment setup fails
      }
    }

    const others = calculateSettings(
      updatedOrder,
      state.isShipmentRequired,
      state.customerAddresses
    )

    console.log('Dispatching SET_PAYMENT action with:', {
      payment: params.payment,
      order: updatedOrder,
      others,
    })
    dispatch({
      type: ActionType.SET_PAYMENT,
      payload: { payment: params.payment, order: updatedOrder, others },
    })
  }

  const placeOrder = async (order?: Order) => {
    console.log('placeOrder called in CheckoutProvider')
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = order ?? (await getOrderFromRef())

    try {
      if (!cl) {
        throw new Error('Commerce Layer client not available')
      }

      // Check if order is already placed
      const orderStatus = await cl.orders.retrieve(currentOrder.id, {
        fields: ['status'],
      })

      if (orderStatus.status === 'placed') {
        console.log('Order already placed')
        dispatch({
          type: ActionType.PLACE_ORDER,
          payload: { order: currentOrder },
        })
        return currentOrder
      }

      if (orderStatus.status === 'draft') {
        console.error('Draft order cannot be placed')
        dispatch({ type: ActionType.STOP_LOADING })
        throw new Error('Draft order cannot be placed')
      }

      // Check if this is a Stripe payment that needs confirmation first
      const isStripePayment =
        currentOrder?.payment_source?.type === 'stripe_payments'

      if (isStripePayment) {
        console.log(
          'Stripe payment detected - payment confirmation should have happened in form submission'
        )
        // For Stripe, the payment confirmation should have already happened
        // when the user submitted the payment form before clicking Place Order
      }

      // Place the order via Commerce Layer API (following official pattern)
      console.log('Placing order via API...', currentOrder.id)

      const placedOrder = await cl.orders.update(
        {
          id: currentOrder.id,
          _place: true, // Official Commerce Layer parameter to place the order
        },
        {
          include: [
            'line_items',
            'shipments',
            'payment_source',
            'payment_method',
          ],
        }
      )

      console.log('Order placed successfully:', placedOrder)

      // Update the order ref with the placed order
      orderRef.current = placedOrder

      dispatch({
        type: ActionType.PLACE_ORDER,
        payload: { order: placedOrder },
      })

      return placedOrder
    } catch (error) {
      console.error('Error placing order:', error)
      dispatch({ type: ActionType.STOP_LOADING })
      throw error
    }
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

        // Update the order ref with the fresh data from API
        orderRef.current = updatedOrder

        // Dispatch the updated order to update the state
        dispatch({
          type: ActionType.UPDATE_ORDER,
          payload: {
            order: updatedOrder,
          },
        })

        return { success: true, order: updatedOrder }
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

  // Enhanced license owner save method that orchestrates the full flow
  const saveLicenseOwner = useCallback(
    async (
      formData: LicenseOwnerInput,
      isForClient: boolean
    ): Promise<{
      success: boolean
      error?: string
      order?: Order
    }> => {
      try {
        if (!cl) {
          return {
            success: false,
            error: 'Commerce Layer client not available',
          }
        }

        if (!state.billingAddress) {
          return { success: false, error: 'Billing address is required' }
        }

        // Prepare the license owner data based on project type
        const owner: LicenseOwner = isForClient
          ? {
              is_client: true,
              ...formData,
            }
          : {
              is_client: false,
              company: state.billingAddress.company,
              full_name: state.billingAddress.full_name,
              line_1: state.billingAddress.line_1,
              line_2: state.billingAddress.line_2,
              city: state.billingAddress.city,
              zip_code: state.billingAddress.zip_code,
              state_code: state.billingAddress.state_code,
              country_code: state.billingAddress.country_code,
            }

        console.log('saveLicenseOwner: Saving license owner:', { owner })

        // Update the order with license metadata
        const result = await updateOrder({
          id: orderId,
          attributes: {
            metadata: {
              license: {
                ...state.order?.metadata?.license,
                owner,
              },
            },
          },
        })

        if (!result.success || !result.order) {
          const errorMessage =
            result.error?.toString() || 'Failed to save license owner'
          return { success: false, error: errorMessage }
        }

        console.log(
          'saveLicenseOwner: License owner saved successfully:',
          result.order
        )

        // Update the license owner state using the existing method
        await setLicenseOwner({
          order: result.order,
          licenseOwner: result.order?.metadata?.license?.owner,
        })

        return { success: true, order: result.order }
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to save license owner'
        console.error('saveLicenseOwner error:', error)
        return { success: false, error: errorMessage }
      }
    },
    [
      cl,
      orderId,
      updateOrder,
      setLicenseOwner,
      state.billingAddress,
      state.order,
    ]
  )

  const getOrderFromRef = async () => {
    if (orderRef.current) {
      return orderRef.current
    }
    
    // Pass localStorage clearing parameters to fetchOrder
    return await fetchOrder(cl, orderId, {
      clearWhenPlaced: orderStorageContext.clearWhenPlaced,
      persistKey: orderStorageContext.persistKey,
      deleteLocalOrder: orderStorageContext.deleteLocalOrder,
    })
  }

  // New address helper methods that call utils layer
  const createBillingAddress = useCallback(
    async (
      addressData: AddressCreate
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
  const loadPaymentMethods = useCallback(async (): Promise<{
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
  }, [cl, orderId, state.isShipmentRequired, state.customerAddresses])

  // New enhanced save methods
  const saveAddress = useCallback(
    async (
      addressData: AddressInput,
      useAsShipping: boolean = false
    ): Promise<{ success: boolean; error?: string; order?: Order }> => {
      try {
        if (!cl) {
          throw new Error('Commerce Layer client not available')
        }

        // Step 1: Validate the address data locally
        const validationResult = validateAddress({ addressData })
        if (!validationResult.success) {
          const errorMessage =
            validationResult.error?.errors?.[0]?.detail ||
            'Invalid address data'
          return { success: false, error: errorMessage }
        }

        // Step 2: Create the billing address
        const createResult = await createBillingAddressUtil({
          cl,
          addressData: addressData as AddressCreate,
        })

        if (!createResult.success || !createResult.data) {
          const errorMessage =
            createResult.error?.errors?.[0]?.detail ||
            'Failed to create address'
          return { success: false, error: errorMessage }
        }

        // Step 3: Attach the address to the order
        const attachResult = await attachBillingAddressToOrderUtil({
          cl,
          orderId,
          addressId: createResult.data.id,
          useAsShipping,
        })

        if (!attachResult.success || !attachResult.data) {
          const errorMessage =
            attachResult.error?.errors?.[0]?.detail ||
            'Failed to attach address to order'
          return { success: false, error: errorMessage }
        }

        // Step 4: Update the checkout provider state with the updated order
        await setAddresses(attachResult.data)
        return { success: true, order: attachResult.data }
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to save address'
        return { success: false, error: errorMessage }
      }
    },
    [cl, orderId, setAddresses]
  )

  // Payment submission registry methods
  const registerPaymentSubmitter = useCallback(
    (submitter: () => Promise<boolean>) => {
      console.log('Registering payment submitter')
      paymentSubmitterRef.current = submitter
    },
    []
  )

  const submitRegisteredPayment = useCallback(async (): Promise<boolean> => {
    console.log('Attempting to submit registered payment')
    if (!paymentSubmitterRef.current) {
      console.log('No payment submitter registered')
      return true // No payment form to submit, continue with order placement
    }

    try {
      const result = await paymentSubmitterRef.current()
      console.log('Payment submission result:', result)
      return result
    } catch (error) {
      console.error('Error during payment submission:', error)
      return false
    }
  }, [])

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
        // Enhanced save method for address (orchestrates multiple steps)
        saveAddress,
        // Enhanced save method for license owner (orchestrates multiple steps)
        saveLicenseOwner,
        // Payment submission registry
        registerPaymentSubmitter,
        submitRegisteredPayment,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}
