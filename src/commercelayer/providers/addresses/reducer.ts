import type {
  Address,
  CommerceLayerClient,
  CommerceLayerConfig,
  Order,
  OrderUpdate,
} from '@commercelayer/sdk'
import type { Dispatch } from 'react'

import type { BaseError, CodeErrorType, TResourceError } from '../customer' // @TODO: move to different file
import type { TCustomerAddress } from '../customer/reducer'

import {
  invertedAddressesHandler,
  sanitizeMetadataFields,
} from '@/commercelayer/utils/addressesManager'
import { formCleaner } from '@/commercelayer/utils/formCleaner'
import camelCase from 'lodash.camelcase'

// import type { AddressValuesKeys } from '#context/BillingAddressFormContext'
export type AddressValuesKeys =
  | `${keyof Address}`
  | `billing_address_${keyof Address}`
  | `shipping_address_${keyof Address}`
  | `billing_address_${`metadata_${string}`}`
  | `shipping_address_${`metadata_${string}`}`

// import type { AddressInputName } from '#typings/index'
export type AddressInputName =
  | 'billing_address_city'
  | 'billing_address_company'
  | 'billing_address_first_name'
  | 'billing_address_email'
  | 'billing_address_last_name'
  | 'billing_address_line_1'
  | 'billing_address_line_2'
  | 'billing_address_phone'
  | 'billing_address_state_code'
  | 'billing_address_zip_code'
  | 'billing_address_billing_info'
  | 'billing_address_save_to_customer_book'
  | `billing_address_${`metadata_${string}`}`
  | 'shipping_address_city'
  | 'shipping_address_company'
  | 'shipping_address_email'
  | 'shipping_address_first_name'
  | 'shipping_address_last_name'
  | 'shipping_address_line_1'
  | 'shipping_address_line_2'
  | 'shipping_address_phone'
  | 'shipping_address_state_code'
  | 'shipping_address_zip_code'
  | 'shipping_address_save_to_customer_book'
  | 'shipping_address_billing_info'
  | `shipping_address_${`metadata_${string}`}`

// TODO: Move in the future
export type CustomFieldMessageError = (props: {
  field: Extract<AddressValuesKeys, AddressInputName> | string
  code?: Extract<CodeErrorType, 'EMPTY_ERROR' | 'VALIDATION_ERROR'> | undefined
  message?: string | undefined
  value: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: Record<string, any>
}) =>
  | string
  | null
  | Array<{
      field: Extract<AddressValuesKeys, AddressInputName> | string
      value: string
      isValid: boolean
      message?: string
    }>

export type AddressField =
  | 'city'
  | 'company'
  | 'country_code'
  | 'first_name'
  | 'last_name'
  | 'line_1'
  | 'line_2'
  | 'phone'
  | 'state_code'
  | 'zip_code'
  | 'billing_info'

export type AddressFieldView = AddressField | 'full_address' | 'full_name'

export const addressFields: AddressField[] = [
  'city',
  'company',
  'country_code',
  'first_name',
  'last_name',
  'line_1',
  'line_2',
  'phone',
  'state_code',
  'zip_code',
]

export type AddressResource = Extract<
  TResourceError,
  'billing_address' | 'shipping_address'
>

export type AddressSchema = Omit<
  Address,
  'created_at' | 'updated_at' | 'id' | 'type'
>

export type AddressState = {
  isLoading: boolean
  errors: BaseError[]

  billing_address?: TCustomerAddress
  shipping_address?: TCustomerAddress
  shipToDifferentAddress?: boolean
  billingAddressId?: string
  shippingAddressId?: string
  isBusiness?: boolean
  invertAddresses?: boolean
}

export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',

  SET_ERRORS = 'SET_ERRORS',
  SET_ADDRESS = 'SET_ADDRESS',
  SET_SHIP_TO_DIFFERENT_ADDRESS = 'SET_SHIP_TO_DIFFERENT_ADDRESS',
  SET_CLONE_ADDRESS = 'SET_CLONE_ADDRESS',
  CLEANUP = 'CLEANUP',
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
      type: ActionType.SET_ADDRESS
      payload: {
        resource: AddressResource
        values: TCustomerAddress
      }
    }
  | {
      type: ActionType.SET_SHIP_TO_DIFFERENT_ADDRESS
      payload: {
        shipToDifferentAddress: boolean
        isBusiness?: boolean
        invertAddresses?: boolean
      }
    }
  | {
      type: ActionType.SET_CLONE_ADDRESS
      payload: {
        billingAddressId?: string
        shippingAddressId?: string
      }
    }
  | { type: ActionType.CLEANUP }

export function reducer(state: AddressState, action: Action): AddressState {
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

    case ActionType.SET_ADDRESS:
      return {
        ...state,
        [action.payload.resource]: {
          ...formCleaner(action.payload.values),
        },
        isLoading: false,
      }

    case ActionType.SET_SHIP_TO_DIFFERENT_ADDRESS:
      return {
        ...state,
        shipToDifferentAddress: action.payload.shipToDifferentAddress,
        isBusiness: action.payload.isBusiness,
        invertAddresses: action.payload.invertAddresses,
        isLoading: false,
      }

    case ActionType.SET_CLONE_ADDRESS:
      return {
        ...state,
        ...action.payload,
        isLoading: false,
      }

    case ActionType.CLEANUP:
      // Keep form state intact; clear transient state.
      return {
        ...state,
        errors: [],
        isLoading: false,
      }

    default:
      throw new Error('Unknown action type')
  }
}

export const addressInitialState: AddressState = {
  isLoading: false,
  errors: [],
}

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

export type SetAddressErrors = <V extends BaseError[]>(args: {
  errors: V
  resource: Extract<TResourceError, 'billing_address' | 'shipping_address'>
  dispatch?: Dispatch<Action>
  currentErrors?: V
}) => void

export interface SetAddressParams<V extends TCustomerAddress> {
  values: V
  resource: AddressResource
  dispatch?: Dispatch<Action>
}

export const setAddressErrors: SetAddressErrors = ({
  errors,
  dispatch,
  currentErrors = [],
  resource,
}) => {
  const billingErrors =
    resource === 'billing_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === 'billing_address')

  const shippingErrors =
    resource === 'shipping_address'
      ? errors.filter((e) => e.resource === resource)
      : currentErrors.filter((e) => e.resource === 'shipping_address')

  const finalErrors = [...billingErrors, ...shippingErrors]

  dispatch?.({
    type: ActionType.SET_ERRORS,
    payload: {
      errors: finalErrors,
    },
  })
}

export function setAddress<V extends TCustomerAddress>({
  values,
  resource,
  dispatch,
}: SetAddressParams<V>): void {
  dispatch?.({
    type: ActionType.SET_ADDRESS,
    payload: {
      resource,
      values,
    },
  })
}

type SetCloneAddress = (
  id: string,
  resource: AddressResource,
  dispatch: Dispatch<Action>
) => void

export const setCloneAddress: SetCloneAddress = (id, resource, dispatch) => {
  dispatch({
    type: ActionType.SET_CLONE_ADDRESS,
    payload: {
      [`${camelCase(resource)}Id`]: id,
    } as { billingAddressId?: string; shippingAddressId?: string },
  })
}

export interface ICustomerAddress {
  id: string | undefined
  resource: AddressResource
}

interface TSaveAddressesParams {
  orderId?: string
  order?: Order | null
  // updateOrder?: typeof updateOrder
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateOrder?: any // @TODO: link this to the OrderProvider
  cl: CommerceLayerClient
  config: CommerceLayerConfig
  state: AddressState
  dispatch: Dispatch<Action>
  getCustomerAddresses?: () => Promise<void>
  customerEmail?: string
  customerAddress?: ICustomerAddress
}

export async function saveAddresses({
  cl,
  updateOrder,
  order,
  state,
  customerEmail,
  customerAddress,
  dispatch,
}: TSaveAddressesParams): Promise<{
  success: boolean
  order?: Order
  error?: unknown
}> {
  dispatch({ type: ActionType.START_LOADING })

  const {
    shipToDifferentAddress,
    invertAddresses,
    billing_address: billingAddressForm,
    shipping_address: shippingAddressForm,
    billingAddressId,
    shippingAddressId,
  } = state

  if (!cl) {
    dispatch({ type: ActionType.STOP_LOADING })
    return { success: false, error: 'Commerce Layer client not available' }
  }

  try {
    const billingAddress = formCleaner(billingAddressForm)
    const shippingAddress = formCleaner(shippingAddressForm)

    if (order) {
      let orderAttributes: OrderUpdate | null = null

      const billingAddressCloneId =
        customerAddress?.resource === 'billing_address'
          ? customerAddress?.id
          : billingAddressId

      const shippingAddressCloneId =
        customerAddress?.resource === 'shipping_address'
          ? customerAddress?.id
          : shippingAddressId

      if (invertAddresses) {
        orderAttributes = await invertedAddressesHandler({
          billingAddress,
          billingAddressId: billingAddressCloneId,
          customerEmail,
          order,
          shipToDifferentAddress,
          shippingAddress,
          shippingAddressId: shippingAddressCloneId,
          sdk: cl,
        })
      } else {
        const doNotShipItems = order?.line_items?.every(
          // @ts-expect-error no type for do_not_ship on SDK
          (lineItem) => lineItem?.item?.do_not_ship === true
        )

        const currentBillingAddressRef = order?.billing_address?.reference

        orderAttributes = {
          id: order?.id,
          _billing_address_clone_id: billingAddressCloneId,
          _shipping_address_clone_id: billingAddressCloneId,
          customer_email: customerEmail,
        }

        if (currentBillingAddressRef === billingAddressCloneId) {
          orderAttributes._billing_address_clone_id = order?.billing_address?.id
          orderAttributes._shipping_address_clone_id =
            order?.shipping_address?.id
        }

        if (
          billingAddress != null &&
          Object.keys(billingAddress).length > 0 &&
          !billingAddressCloneId
        ) {
          delete orderAttributes._billing_address_clone_id
          delete orderAttributes._shipping_address_clone_id

          if (!doNotShipItems) {
            orderAttributes._shipping_address_same_as_billing = true
          }

          const billingAddressWithMeta = sanitizeMetadataFields(billingAddress)
          const address = await cl.addresses.create(billingAddressWithMeta)
          orderAttributes.billing_address = cl.addresses.relationship(address.id)
        }

        if (shipToDifferentAddress) {
          delete orderAttributes._shipping_address_same_as_billing

          if (shippingAddressCloneId)
            orderAttributes._shipping_address_clone_id = shippingAddressCloneId

          if (shippingAddress != null && Object.keys(shippingAddress).length > 0) {
            delete orderAttributes._shipping_address_clone_id

            const shippingAddressWithMeta = sanitizeMetadataFields(shippingAddress)
            const address = await cl.addresses.create(shippingAddressWithMeta)
            orderAttributes.shipping_address = cl.addresses.relationship(address.id)
          }
        }
      }

      if (orderAttributes != null && updateOrder) {
        const orderUpdated = await updateOrder({
          id: order.id,
          attributes: orderAttributes,
        })

        dispatch({ type: ActionType.STOP_LOADING })
        return { success: true, order: orderUpdated?.order }
      }
    }

    dispatch({ type: ActionType.STOP_LOADING })
    return { success: false }
  } catch (error) {
    dispatch({
      type: ActionType.SET_ERRORS,
      payload: { errors: normalizeErrors(error) },
    })

    return { success: false, error }
  }
}
