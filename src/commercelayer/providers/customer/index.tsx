import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type JSX,
} from 'react'

import {
  createCustomerAddress,
  customerInitialState,
  reducer as customerReducer,
  deleteCustomerAddress,
  getCustomerAddresses,
  getCustomerInfo,
  getCustomerOrders,
  getCustomerPayments,
  getCustomerSubscriptions,
  setCustomerEmail,
  setCustomerErrors,
  SetCustomerErrors,
  type CustomerState,
  type TCustomerAddress,
} from './reducer'

// import type { BaseError } from '#typings/errors'
export type CodeErrorType =
  | 'EMPTY_ERROR'
  | 'FILTER_NOT_ALLOWED'
  | 'FORBIDDEN'
  | 'INTERNAL_SERVER_ERROR'
  | 'INVALID_DATA_FORMAT'
  | 'INVALID_FIELD'
  | 'INVALID_FIELD_FORMAT'
  | 'INVALID_FIELD_VALUE'
  | 'INVALID_FILTERS_SYNTAX'
  | 'INVALID_FILTER_VALUE'
  | 'INVALID_INCLUDE'
  | 'INVALID_LINKS_OBJECT'
  | 'INVALID_PAGE_OBJECT'
  | 'INVALID_PAGE_VALUE'
  | 'INVALID_RESOURCE'
  | 'INVALID_RESOURCE_ID'
  | 'INVALID_SORT_CRITERIA'
  | 'INVALID_TOKEN'
  | 'KEY_NOT_INCLUDED_IN_URL'
  | 'KEY_ORDER_MISMATCH'
  | 'LOCKED'
  | 'NOT_ACCEPTABLE'
  | 'OUT_OF_STOCK'
  | 'PARAM_MISSING'
  | 'PARAM_NOT_ALLOWED'
  | 'PAYMENT_NOT_APPROVED_FOR_EXECUTION'
  | 'PAYMENT_INTENT_AUTHENTICATION_FAILURE'
  | 'RECORD_NOT_FOUND'
  | 'RECORD_NOT_FOUND'
  | 'RELATION_EXISTS'
  | 'NO_SHIPPING_METHODS'
  | 'SAVE_FAILED'
  | 'TYPE_MISMATCH'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'VALIDATION_ERROR'

export type TResourceError =
  | 'addresses'
  | 'billing_address'
  | 'gift_cards'
  | 'gift_card_or_coupon_code'
  | 'line_items'
  | 'orders'
  | 'payment_methods'
  | 'prices'
  | 'shipments'
  | 'shipping_address'
  | 'customer_address'
  | 'sku_options'
  | 'variant'
  | 'in_stock_subscriptions'

export interface BaseError {
  code: CodeErrorType
  message: string
  resource?: TResourceError | null
  field?: string
  id?: string
  title?: string
  detail?: string
  status?: string
}

import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import type { QueryPageSize } from '@commercelayer/sdk'

export type InitialCustomerContext = Partial<
  {
    setCustomerErrors: SetCustomerErrors
    setCustomerEmail: typeof setCustomerEmail
    deleteCustomerAddress: typeof deleteCustomerAddress
    getCustomerAddresses: typeof getCustomerAddresses
    createCustomerAddress: (address: TCustomerAddress) => Promise<void>
    getCustomerOrders: (
      props: Partial<Parameters<typeof getCustomerOrders>[0]>
    ) => Promise<void>
    getCustomerSubscriptions: (
      props: Partial<Parameters<typeof getCustomerSubscriptions>[0]>
    ) => Promise<void>
    reloadCustomerAddresses: () => Promise<void>
  } & CustomerState
>

export const defaultCustomerContext = {}

export const CustomerContext = createContext<InitialCustomerContext>(
  defaultCustomerContext
)

export const useCustomerContext = () => {
  const context = React.useContext(CustomerContext)
  if (!context) {
    throw new Error('useCustomerContext must be used within a CustomerProvider')
  }
  return context
}

interface Props {
  children: any // DefaultChildrenType
  customerId: string
  config: any
  /**
   * Customer type
   */
  isGuest?: boolean
  /**
   * The page size
   * default: 10
   */
  addressesPageSize?: QueryPageSize
}

/**
 * Main container for the Customers components.
 * It stores - in its context - the details of an active customer, if present.
 *
 *
 * <span title='Children' type='info'>
 * `<CustomerField>`,
 * `<CustomerInput>`,
 * `<SaveCustomerButton>`,
 * `<AddressesContainer>`,
 * `<AddressesEmpty>`,
 * `<CustomerPaymentSource>`,
 * `<CustomerPaymentSourceEmpty>`,
 * `<PaymentMethodsContainer>`,
 * `<OrdersList>`
 * </span>
 */
export function CustomerProvider(props: Props): JSX.Element {
  const { config, customerId, children, addressesPageSize: pageSize } = props
  const [state, dispatch] = useReducer(customerReducer, customerInitialState)

  const { accessToken } = config

  const cl = isValidCommerceLayerConfig(config)
    ? getCommerceLayer(config)
    : undefined

  // @NOTE: make sure to include these resources in fetch
  // 'available_customer_payment_sources.payment_source',
  // 'available_customer_payment_sources.payment_method'

  useEffect(() => {
    if (accessToken) {
    }
  }, [accessToken])

  useEffect(() => {
    if (accessToken) {
      if (state.customers == null) {
        getCustomerInfo({ customerId, cl, dispatch })
      }
      if (state.addresses == null) {
        getCustomerAddresses({
          cl,
          dispatch,
          // isOrderAvailable: withoutIncludes != null,
          pageSize,
        })
        console.log('state.addresses == null, ')
      }
      async function getCustomerData(): Promise<void> {
        await getCustomerOrders({ customerId, cl, config, dispatch })
        await getCustomerSubscriptions({ cl, customerId, dispatch })
        await getCustomerPayments({ cl, customerId, dispatch })
      }
      getCustomerData()
    }
  }, [accessToken])

  const contextValue = useMemo(() => {
    return {
      ...state,
      setCustomerErrors: (errors: BaseError[]) => {
        setCustomerErrors(errors, dispatch)
      },
      setCustomerEmail: (customerEmail: string) => {
        setCustomerEmail(customerEmail, dispatch)
      },
      deleteCustomerAddress: async ({
        customerAddressId,
      }: {
        customerAddressId: string
      }) => {
        await deleteCustomerAddress({
          customerAddressId,
          dispatch,
          cl,
          addresses: state.addresses,
        })
      },
      createCustomerAddress: async (address: TCustomerAddress) => {
        await createCustomerAddress({ address, cl, dispatch, state })
      },
      getCustomerOrders: async ({
        pageNumber,
        pageSize,
      }: {
        pageNumber?: number
        pageSize?: QueryPageSize
      }) => {
        await getCustomerOrders({
          config,
          customerId,
          cl,
          dispatch,
          pageNumber,
          pageSize,
        })
      },
      getCustomerSubscriptions: async ({
        pageNumber,
        pageSize,
        id,
      }: {
        pageNumber?: number
        pageSize?: QueryPageSize
        id?: string
      }) => {
        await getCustomerSubscriptions({
          config,
          cl,
          customerId,
          dispatch,
          pageNumber,
          pageSize,
          id,
        })
      },
      reloadCustomerAddresses: async () => {
        await getCustomerAddresses({
          cl,
          dispatch,
          isOrderAvailable: false,
          pageSize,
        })
      },
    }
  }, [state])
  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  )
}

export default CustomerProvider
