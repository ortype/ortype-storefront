import type { Dispatch } from 'react'

import type {
  Address,
  AddressCreate,
  AddressUpdate,
  CommerceLayerClient,
  CommerceLayerConfig,
  Customer,
  CustomerPaymentSource,
  ListResponse,
  Order,
  OrderSubscription,
  QueryPageSize,
} from '@commercelayer/sdk'

import type { BaseError } from './index'

export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',

  SET_ERRORS = 'SET_ERRORS',
  SET_CUSTOMER_EMAIL = 'SET_CUSTOMER_EMAIL',
  SET_ADDRESSES = 'SET_ADDRESSES',
  SET_PAYMENTS = 'SET_PAYMENTS',
  SET_ORDERS = 'SET_ORDERS',
  SET_SUBSCRIPTIONS = 'SET_SUBSCRIPTIONS',
  SET_CUSTOMERS = 'SET_CUSTOMERS',
}

export type CustomerState = {
  isLoading: boolean
  errors: BaseError[]
  addresses: Address[] | null
  payments: CustomerPaymentSource[] | null

  customerEmail?: string
  orders?: ListResponse<Order>
  subscriptions?: ListResponse<OrderSubscription> | ListResponse<Order> | null
  isGuest?: boolean
  customers?: Customer
}

export type Action =
  | { type: ActionType.START_LOADING }
  | { type: ActionType.STOP_LOADING }
  | {
      type: ActionType.SET_ERRORS
      payload: {
        errors: BaseError[]
      }
    }
  | {
      type: ActionType.SET_CUSTOMER_EMAIL
      payload: {
        customerEmail: string
      }
    }
  | {
      type: ActionType.SET_ADDRESSES
      payload: {
        addresses: Address[] | null
      }
    }
  | {
      type: ActionType.SET_PAYMENTS
      payload: {
        payments: CustomerPaymentSource[] | null
      }
    }
  | {
      type: ActionType.SET_ORDERS
      payload: {
        orders: ListResponse<Order>
      }
    }
  | {
      type: ActionType.SET_SUBSCRIPTIONS
      payload: {
        subscriptions:
          | ListResponse<OrderSubscription>
          | ListResponse<Order>
          | null
      }
    }
  | {
      type: ActionType.SET_CUSTOMERS
      payload: {
        customers: Customer
        customerEmail?: string
      }
    }

export function reducer(state: CustomerState, action: Action): CustomerState {
  switch (action.type) {
    case ActionType.START_LOADING:
      return {
        ...state,
        isLoading: true,
      }

    case ActionType.STOP_LOADING:
      return {
        ...state,
        isLoading: false,
      }

    case ActionType.SET_ERRORS:
      return {
        ...state,
        errors: action.payload.errors,
        isLoading: false,
      }

    case ActionType.SET_CUSTOMER_EMAIL:
      return {
        ...state,
        customerEmail: action.payload.customerEmail,
        isLoading: false,
      }

    case ActionType.SET_ADDRESSES:
      return {
        ...state,
        addresses: action.payload.addresses,
        isLoading: false,
      }

    case ActionType.SET_PAYMENTS:
      return {
        ...state,
        payments: action.payload.payments,
        isLoading: false,
      }

    case ActionType.SET_ORDERS:
      return {
        ...state,
        orders: action.payload.orders,
        isLoading: false,
      }

    case ActionType.SET_SUBSCRIPTIONS:
      return {
        ...state,
        subscriptions: action.payload.subscriptions,
        isLoading: false,
      }

    case ActionType.SET_CUSTOMERS:
      return {
        ...state,
        customers: action.payload.customers,
        customerEmail: action.payload.customerEmail ?? state.customerEmail,
        isLoading: false,
      }

    default:
      throw new Error('Unknown action type')
  }
}

export type SetSaveOnBlur = (args: {
  saveOnBlur: boolean
  dispatch: Dispatch<Action>
}) => void

export type SetCustomerErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<Action>
) => void

function normalizeErrors(error: unknown): BaseError[] {
  if (Array.isArray(error)) {
    const looksLikeBaseErrorArray = error.every(
      (e) => e && typeof e === 'object' && 'code' in e && 'message' in e
    )

    if (looksLikeBaseErrorArray) {
      return error as BaseError[]
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'Unknown error'

  return [
    {
      code: 'EMPTY_ERROR',
      message,
    },
  ]
}

export function setCustomerErrors(
  errors: BaseError[],
  dispatch?: Dispatch<Action>
): void {
  dispatch?.({
    type: ActionType.SET_ERRORS,
    payload: { errors },
  })
}

export function setCustomerEmail(
  customerEmail: string,
  dispatch?: Dispatch<Action>
): void {
  dispatch?.({
    type: ActionType.SET_CUSTOMER_EMAIL,
    payload: { customerEmail },
  })
}

export interface GetCustomerAddresses {
  cl: CommerceLayerClient
  /**
   * The Commerce Layer config
   */
  config?: CommerceLayerConfig
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<Action>
  /**
   * Order details
   */
  isOrderAvailable?: boolean
  /**
   * The page size
   * default: 10
   */
  pageSize?: QueryPageSize
}

export async function getCustomerAddresses({
  cl,
  dispatch,
  isOrderAvailable,
  pageSize = 10,
}: GetCustomerAddresses): Promise<void> {
  if (!cl) return

  dispatch({ type: ActionType.START_LOADING })
  try {
    const addresses: Address[] = []
    const customerAddresses = await cl.customer_addresses.list({
      include: ['address'],
      pageSize,
    })

    console.log('[CustomerProvider] getCustomerAddresses: ', customerAddresses)

    customerAddresses.forEach((customerAddress) => {
      if (customerAddress.address) {
        if (customerAddress.address.reference == null) {
          customerAddress.address.reference = customerAddress.id
        }

        if (
          customerAddress.id !== customerAddress.address.reference &&
          !isOrderAvailable
        ) {
          customerAddress.address.reference = customerAddress.id
        }

        addresses.push(customerAddress.address)
      }
    })

    addresses.sort((a, b) => {
      if (a.full_name && b.full_name)
        return a.full_name.localeCompare(b.full_name)
      return 0
    })

    console.log('[CustomerProvider] SET_ADDRESSES: ', addresses)
    dispatch({
      type: ActionType.SET_ADDRESSES,
      payload: { addresses },
    })
  } catch (error: unknown) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: {
        errors: normalizeErrors(error),
      },
    })
  }
}

export interface DeleteCustomerAddress {
  cl: CommerceLayerClient
  config?: CommerceLayerConfig
  dispatch?: Dispatch<Action>
  customerAddressId: string
  addresses?: Address[] | null
}

export async function deleteCustomerAddress({
  cl,
  dispatch,
  customerAddressId,
  addresses,
}: DeleteCustomerAddress): Promise<void> {
  if (addresses && dispatch) {
    dispatch({ type: ActionType.START_LOADING })

    try {
      await cl.customer_addresses.delete(customerAddressId)

      const newAddresses = addresses.filter(
        ({ reference }) => reference !== customerAddressId
      )

      dispatch({
        type: ActionType.SET_ADDRESSES,
        payload: {
          addresses: newAddresses,
        },
      })
    } catch (error) {
      dispatch({
        type: ActionType.SET_ERRORS,
        payload: {
          errors: normalizeErrors(error),
        },
      })

      throw new Error("Couldn't delete address")
    }
  }
}

interface GetCustomerOrdersProps {
  cl?: CommerceLayerClient
  config?: CommerceLayerConfig
  customerId: string
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<Action>
  /**
   * The page size
   */
  pageSize?: QueryPageSize
  /**
   * The page number
   */
  pageNumber?: number
  /**
   * Retrieve a specific subscription or order by id
   */
  id?: string
}

export async function getCustomerOrders({
  customerId,
  cl,
  dispatch,
  pageSize = 10,
  pageNumber = 1,
}: GetCustomerOrdersProps): Promise<void> {
  if (!customerId || !cl) return

  dispatch({ type: ActionType.START_LOADING })

  try {
    const orders = await cl.customers.orders(customerId, {
      filters: { status_not_in: 'draft,pending' },
      pageSize,
      pageNumber,
    })

    dispatch({
      type: ActionType.SET_ORDERS,
      payload: { orders },
    })
  } catch (error) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })
  }
}

export async function getCustomerSubscriptions({
  cl,
  customerId,
  id,
  dispatch,
  pageSize = 10,
  pageNumber = 1,
}: GetCustomerOrdersProps): Promise<void> {
  if (!customerId || !cl) return

  dispatch({ type: ActionType.START_LOADING })

  try {
    if (id != null) {
      const subscriptions = await cl.customers.orders(customerId, {
        filters: { order_subscription_id_eq: id },
        include: ['authorizations'],
        pageSize,
        pageNumber,
      })

      dispatch({
        type: ActionType.SET_SUBSCRIPTIONS,
        payload: { subscriptions },
      })
    } else {
      const subscriptions = await cl.customers.order_subscriptions(customerId, {
        pageSize,
        pageNumber,
      })

      dispatch({
        type: ActionType.SET_SUBSCRIPTIONS,
        payload: { subscriptions },
      })
    }
  } catch (error) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })
  }
}

export type TCustomerAddress = AddressCreate &
  AddressUpdate &
  Record<string, string | null | undefined>

interface TCreateCustomerAddress {
  /**
   * Customer address dispatch function
   */
  dispatch?: Dispatch<Action>
  /**
   * The Commerce Layer Config
   */
  config?: CommerceLayerConfig
  /**
   * The address to create or update if there is an id
   */
  address: TCustomerAddress
  /**
   * Current state of the customer
   */
  state?: CustomerState
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cl: CommerceLayerClient
}

export async function createCustomerAddress({
  address,
  cl,
  dispatch,
  state,
}: TCreateCustomerAddress): Promise<void> {
  if (!address) return

  dispatch?.({ type: ActionType.START_LOADING })

  const { id } = address

  try {
    if (id) {
      const upAddress = await cl.addresses.update(address)
      const updatedAddresses = state?.addresses?.map((a) => {
        if (a.id === upAddress.id) return upAddress
        return a
      })

      dispatch?.({
        type: ActionType.SET_ADDRESSES,
        payload: { addresses: updatedAddresses ?? null },
      })

      return
    }

    const newAddress = await cl.addresses.create(address)

    if (state?.customers?.id && newAddress?.id) {
      // @ts-expect-error Expected customer_email
      const newCustomerAddress = await cl.customer_addresses.create({
        customer: cl.customers.relationship(state.customers.id),
        address: cl.addresses.relationship(newAddress.id),
      })

      await cl.addresses.update({
        id: newAddress.id,
        reference: newCustomerAddress.id,
      })

      if (dispatch && state?.addresses) {
        newAddress.reference = newCustomerAddress.id

        dispatch({
          type: ActionType.SET_ADDRESSES,
          payload: { addresses: [...state.addresses, newAddress] },
        })
      }
    }
  } catch (error) {
    dispatch?.({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })

    throw new Error("Couldn't create customer address")
  }
}

interface GetCustomerPaymentsParams extends GetCustomerOrdersProps {}

export async function getCustomerPayments({
  cl,
  customerId,
  dispatch,
  pageSize = 10,
  pageNumber = 1,
}: GetCustomerPaymentsParams): Promise<void> {
  if (!cl || !customerId) return

  dispatch({ type: ActionType.START_LOADING })

  try {
    const payments = await cl.customer_payment_sources.list({
      include: ['payment_source'],
      pageNumber,
      pageSize,
    })

    console.log('[CustomerProvider] SET_PAYMENTS: ', payments)

    dispatch({
      type: ActionType.SET_PAYMENTS,
      payload: {
        payments,
      },
    })
  } catch (error) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })
  }
}

export async function getCustomerInfo({
  customerId,
  cl,
  dispatch,
}: GetCustomerPaymentsParams): Promise<void> {
  if (!cl || !customerId) return

  dispatch({ type: ActionType.START_LOADING })

  try {
    const customers = await cl.customers.retrieve(customerId)
    const customerEmail = customers.email

    dispatch({
      type: ActionType.SET_CUSTOMERS,
      payload: {
        customers,
        customerEmail,
      },
    })
  } catch (error) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })
  }
}

export const customerInitialState: CustomerState = {
  isLoading: false,
  errors: [],
  addresses: null,
  payments: null,
}
