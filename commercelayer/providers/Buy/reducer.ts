import { AppStateData } from '@/commercelayer/providers/Buy'
import {
  LineItem,
  Order,
  PaymentMethod,
  ShippingMethod,
  SkuOption,
} from '@commercelayer/sdk'
export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',
  SET_LICENSE_SIZE = 'SET_LICENSE_SIZE',
  SET_LICENSE_TYPES = 'SET_LICENSE_TYPES',
  SET_SKU_OPTIONS = 'SET_SKU_OPTIONS',
  DELETE_LINE_ITEM = 'DELETE_LINE_ITEM',
  ADD_LINE_ITEM = 'ADD_LINE_ITEM',
}

export type Action =
  | { type: ActionType.START_LOADING }
  | { type: ActionType.STOP_LOADING }
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
        // lineItem: LineItem
        others: Partial<AppStateData>
        // licenseTypes: string[]
      }
    }
  | {
      type: ActionType.SET_SKU_OPTIONS
      payload: {
        skuOptions: SkuOption[]
        others: Partial<AppStateData>
      }
    }
  | {
      type: ActionType.DELETE_LINE_ITEM
      payload: {
        order: Order
      }
    }
  | {
      type: ActionType.ADD_LINE_ITEM
      payload: {
        order: Order
      }
    }

export function reducer(state: AppStateData, action: Action): AppStateData {
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
    case ActionType.ADD_LINE_ITEM: {
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
