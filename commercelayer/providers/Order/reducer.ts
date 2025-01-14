import { Order, SkuOption } from '@commercelayer/sdk'
import { LicenseOwner, OrderStateData } from '@/commercelayer/providers/Order'
export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',
  SET_ORDER = 'SET_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  SET_LICENSE_OWNER = 'SET_LICENSE_OWNER',
  SET_LICENSE_SIZE = 'SET_LICENSE_SIZE',
  SET_LICENSE_TYPES = 'SET_LICENSE_TYPES',
  SET_SKU_OPTIONS = 'SET_SKU_OPTIONS',
  DELETE_LINE_ITEM = 'DELETE_LINE_ITEM',
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
        // others: Partial<OrderStateData>
      }
    }
  | {
      type: ActionType.SET_LICENSE_OWNER
      payload: {
        order: Order
        licenseOwner: LicenseOwner
      }
    }
  | {
      type: ActionType.SET_LICENSE_SIZE
      payload: {
        order: Order
        licenseSize: string
      }
    }
  | {
      type: ActionType.SET_LICENSE_TYPES
      payload: {
        order: Order
        others?: Partial<OrderStateData>
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
    case ActionType.SET_ORDER:
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    case ActionType.UPDATE_ORDER:
      return {
        ...state,
        order: action.payload.order,
        isLoading: false,
      }
    case ActionType.SET_LICENSE_OWNER: {
      console.log('SET_LICENSE_OWNER: action.payload: ', action.payload)
      return {
        ...state,
        order: action.payload.order,
        licenseOwner: action.payload.licenseOwner,
        hasLicenseOwner: true,
        isLicenseForClient: action.payload.licenseOwner.is_client,
        isLoading: false,
      }
    }
    case ActionType.SET_LICENSE_SIZE: {
      console.log('SET_LICENSE_SIZE: action.payload: ', action.payload)
      return {
        ...state,
        order: action.payload.order,
        licenseSize: action.payload.licenseSize,
        isLoading: false,
      }
    }
    case ActionType.SET_LICENSE_TYPES: {
      console.log('SET_LICENSE_TYPES: action.payload: ', action.payload)
      return {
        ...state,
        order: action.payload.order,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.SET_SKU_OPTIONS: {
      return {
        ...state,
        skuOptions: action.payload.skuOptions,
        ...action.payload.others,
        isLoading: false,
      }
    }
    case ActionType.DELETE_LINE_ITEM: {
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
