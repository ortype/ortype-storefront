import {
  LicenseOwnerInput,
  LicenseSize,
  OrderStateData,
} from '@/commercelayer/providers/Order'
import { Order, SkuOption } from '@commercelayer/sdk'
export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',
  SET_ORDER = 'SET_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  CREATE_ORDER = 'CREATE_ORDER',
  SET_LICENSE_OWNER = 'SET_LICENSE_OWNER',
  SET_LICENSE_SIZE = 'SET_LICENSE_SIZE',
  SET_LICENSE_TYPES = 'SET_LICENSE_TYPES',
  SET_SKU_OPTIONS = 'SET_SKU_OPTIONS',
  DELETE_LINE_ITEM = 'DELETE_LINE_ITEM',
  ADD_TO_CART = 'ADD_TO_CART',
}

export type Action =
  | { type: ActionType.START_LOADING }
  | { type: ActionType.STOP_LOADING }
  | {
      type: ActionType.SET_ORDER
      payload: {
        order: Order
        others: Partial<OrderStateData>
      }
    }
  | {
      type: ActionType.UPDATE_ORDER
      payload: {
        order: Order
      }
    }
  | {
      type: ActionType.CREATE_ORDER
      payload: {
        order: Order
        orderId: string
        others: Partial<OrderStateData> & {
          itemsCount: number
          isInvalid: boolean
          hasLicenseOwner: boolean
          isLicenseForClient: boolean
          licenseOwner: LicenseOwnerInput
          licenseSize: LicenseSize
        }
      }
    }
  | {
      type: ActionType.SET_LICENSE_OWNER
      payload: {
        order: Order
        others: {
          hasLicenseOwner: boolean
          isLicenseForClient: boolean
          licenseOwner: LicenseOwnerInput
        }
      }
    }
  | {
      type: ActionType.SET_LICENSE_SIZE
      payload: {
        order: Order
        licenseSize: LicenseSize
      }
    }
  | {
      type: ActionType.SET_LICENSE_TYPES
      payload: {
        order: Order
        others: Partial<OrderStateData>
      }
    }
  | {
      type: ActionType.SET_SKU_OPTIONS
      payload: {
        skuOptions: SkuOption[]
        others: Partial<OrderStateData>
      }
    }
  | {
      type: ActionType.ADD_TO_CART
      payload: {
        order: Order
        orderId: string
        others: Partial<OrderStateData> & {
          itemsCount: number
          hasLicenseOwner: boolean
          isLicenseForClient: boolean
          licenseOwner: LicenseOwnerInput
          licenseSize: LicenseSize
        }
      }
    }
  | {
      type: ActionType.DELETE_LINE_ITEM
      payload: {
        order: Order
      }
    }

export function reducer(state: OrderStateData, action: Action): OrderStateData {
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
    case ActionType.SET_ORDER: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: SET_ORDER: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.UPDATE_ORDER: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: UPDATE_ORDER: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        isLoading: false,
      }
    }
    case ActionType.SET_LICENSE_OWNER: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: SET_LICENSE_OWNER: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        orderId: action.payload.order.id,
        hasLicenseOwner: action.payload.others.hasLicenseOwner,
        isLicenseForClient: action.payload.others.isLicenseForClient,
        licenseOwner: action.payload.others.licenseOwner,
        isLoading: false,
      }
    }
    case ActionType.SET_LICENSE_SIZE: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: SET_LICENSE_SIZE: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        licenseSize: action.payload.licenseSize,
        isLoading: false,
      }
    }
    case ActionType.SET_LICENSE_TYPES: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: SET_LICENSE_TYPES: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.SET_SKU_OPTIONS: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: SET_SKU_OPTIONS: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        skuOptions: action.payload.skuOptions,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.CREATE_ORDER: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: CREATE_ORDER: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        orderId: action.payload.orderId,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.ADD_TO_CART: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: ADD_TO_CART: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        orderId: action.payload.orderId,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.DELETE_LINE_ITEM: {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider]: Reducer: DELETE_LINE_ITEM: action.payload:',
          action.payload
        )
      }
      return {
        ...state,
        order: action.payload.order,
        isLoading: false,
      }
    }
    default:
      throw new Error(`Unknown action type`)
  }
}
