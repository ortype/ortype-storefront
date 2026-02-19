import type { Dispatch } from 'react'
import type { BaseError } from './index'
import type {
  Address,
  AddressCreate,
  AddressUpdate,
  CommerceLayerClient,
  Customer,
  CustomerPaymentSource,
  ListResponse,
  Order,
  OrderSubscription,
  QueryPageSize
} from '@commercelayer/sdk'
import type { CommerceLayerConfig } from '@commercelayer/sdk'
// import getErrors from '#utils/getErrors'
// import { sanitizeMetadataFields } from '#utils/addressesManager'

export type CustomerActionType =
  | 'setErrors'
  | 'setCustomerEmail'
  | 'setAddresses'
  | 'setPayments'
  | 'setOrders'
  | 'setSubscriptions'
  | 'setCustomers'

export interface CustomerActionPayload {
  addresses: Address[] | null
  payments: CustomerPaymentSource[] | null
  customerEmail: string
  errors: BaseError[]
  orders: ListResponse<Order>
  subscriptions: ListResponse<OrderSubscription> | ListResponse<Order> | null
  isGuest: boolean
  customers: Customer
}

export type CustomerState = Partial<CustomerActionPayload>

export interface CustomerAction {
  type: CustomerActionType
  payload: Partial<CustomerActionPayload>
}

export type SetSaveOnBlur = (args: {
  saveOnBlur: boolean
  dispatch: Dispatch<CustomerAction>
}) => void

export type SetCustomerErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<CustomerAction>
) => void

export function setCustomerErrors(
  /**
   * @param errors - An array of errors
   */
  errors: BaseError[],
  /**
   * @param dispatch - The dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
): void {
  if (dispatch)
    dispatch({
      type: 'setErrors',
      payload: {
        errors
      }
    })
}

export function setCustomerEmail(
  /**
   * @param customerEmail The email address of the customer
   */
  customerEmail: string,
  /**
   * @param dispatch The dispatch function
   */
  dispatch?: Dispatch<CustomerAction>
): void {
  if (dispatch)
    dispatch({
      type: 'setCustomerEmail',
      payload: {
        customerEmail
      }
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
  dispatch: Dispatch<CustomerAction>
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
  pageSize = 10
}: GetCustomerAddresses): Promise<void> {
  try {
    const addresses = [] as Address[]
    const customerAddresses = await cl.customer_addresses.list({
      include: ['address'],
      pageSize
    })
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
    dispatch({
      type: 'setAddresses',
      payload: { addresses }
    })
  } catch (error: any) {
    // const errors = getErrors({ error, resource: 'addresses' })
    dispatch({
      type: 'setErrors',
      payload: {
        errors: error
      }
    })
  }
}

export interface DeleteCustomerAddress {
  cl: CommerceLayerClient
  config?: CommerceLayerConfig
  dispatch?: Dispatch<CustomerAction>
  customerAddressId: string
  addresses?: Address[] | null
}

export async function deleteCustomerAddress({
  cl,
  dispatch,
  customerAddressId,
  addresses
}: DeleteCustomerAddress): Promise<void> {
  if (addresses && dispatch) {
    try {
      await cl.customer_addresses.delete(customerAddressId)
      const newAddresses = addresses.filter(
        ({ reference }) => reference !== customerAddressId
      )
      dispatch({
        type: 'setAddresses',
        payload: {
          addresses: newAddresses
        }
      })
    } catch (error) {
      throw new Error("Couldn't delete address")
    }
  }
}

interface GetCustomerOrdersProps {
  cl?: any
  customerId?: any
  config?: any
  /**
   * The Customer dispatch function
   */
  dispatch: Dispatch<CustomerAction>
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
  config,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerOrdersProps): Promise<void> {
  if (customerId) {
    const orders = await cl.customers.orders(customerId, {
      filters: { status_not_in: 'draft,pending' },
      pageSize,
      pageNumber
    })
    dispatch({
      type: 'setOrders',
      payload: { orders }
    })
  }
}

export async function getCustomerSubscriptions({
  cl,
  customerId, 
  id,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerOrdersProps): Promise<void> {
    if (customerId) {
      if (id != null) {
        const subscriptions = await cl.customers.orders(customerId, {
          filters: { order_subscription_id_eq: id },
          include: ['authorizations'],
          pageSize,
          pageNumber
        })
        dispatch({
          type: 'setSubscriptions',
          payload: { subscriptions }
        })
      } else {
        const subscriptions = await cl.customers.order_subscriptions(
          customerId,
          {
            pageSize,
            pageNumber
          }
        )
        dispatch({
          type: 'setSubscriptions',
          payload: { subscriptions }
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
  dispatch?: Dispatch<CustomerAction>
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
}

export async function createCustomerAddress({
  address,
  cl,
  dispatch,
  state
}: TCreateCustomerAddress): Promise<void> {
  if (address) {
    const { id } = address
    try {
      if (id) {
        // const addressWithMeta = sanitizeMetadataFields(address) as AddressUpdate
        const upAddress = await cl.addresses.update(address)
        const updatedAddresses = state?.addresses?.map((a) => {
          if (a.id === upAddress.id) return upAddress
          return a
        })
        if (dispatch) {
          dispatch({
            type: 'setAddresses',
            payload: { addresses: updatedAddresses }
          })
        }
      } else {
        // const addressWithMeta = sanitizeMetadataFields(address)
        const newAddress = await cl.addresses.create(address)
        if (state?.customers?.id && newAddress?.id) {
          // @ts-expect-error Expected customer_email
          const newCustomerAddress = await cl.customer_addresses.create({
            customer: cl.customers.relationship(state?.customers?.id),
            address: cl.addresses.relationship(newAddress.id)
          })
          await cl.addresses.update({
            id: newAddress.id,
            reference: newCustomerAddress.id
          })
          if (dispatch && state?.addresses) {
            newAddress.reference = newCustomerAddress.id
            dispatch({
              type: 'setAddresses',
              payload: { addresses: [...state.addresses, newAddress] }
            })
          }
        }
      }
    } catch (error) {
      throw new Error("Couldn't create customer address")
    }
  }
}

interface GetCustomerPaymentsParams extends GetCustomerOrdersProps {
  config: any
  customerId: string
  cl: any
}

export async function getCustomerPayments({
  cl,
  customerId,
  dispatch,
  pageSize = 10,
  pageNumber = 1
}: GetCustomerPaymentsParams): Promise<void> {
  if (customerId != null && dispatch != null) {
    if (customerId) {
      const payments = await cl.customer_payment_sources.list({
        include: ['payment_source'],
        pageNumber,
        pageSize
      })
      dispatch({
        type: 'setPayments',
        payload: {
          payments
        }
      })
    }
  }
}

export async function getCustomerInfo({
  customerId,
  cl,
  dispatch
}: GetCustomerPaymentsParams): Promise<void> {
  if (dispatch != null) {
    if (customerId) {
      const customers = await cl.customers.retrieve(customerId)
      const customerEmail = customers.email
      dispatch({
        type: 'setCustomers',
        payload: {
          customers,
          customerEmail
        }
      })
    }
  }
}

export const customerInitialState: CustomerState = {
  errors: [],
  addresses: null,
  payments: null
}

const type: CustomerActionType[] = [
  'setErrors',
  'setCustomerEmail',
  'setAddresses',
  'setPayments',
  'setOrders',
  'setSubscriptions',
  'setCustomers'
]

const baseReducer = (state, action, actionTypes) => {
  const actions = actionTypes
  if (actions.includes(action.type)) {
    const data = action.payload
    state = { ...state, ...data }
  }
  return state
}

const customerReducer = (
  state: CustomerState,
  reducer: CustomerAction
): CustomerState =>
  baseReducer<CustomerState, CustomerAction, CustomerActionType[]>(
    state,
    reducer,
    type
  )


export default customerReducer
