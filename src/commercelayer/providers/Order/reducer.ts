import {
  LicenseOwnerInput,
  OrderStateData,
} from '@/commercelayer/providers/Order'
import type { LicenseSize, SelectionBuffer, StyleEntry } from './types'
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
  // Legacy actions (kept for backward compat during migration)
  DELETE_LINE_ITEM = 'DELETE_LINE_ITEM',
  ADD_TO_CART = 'ADD_TO_CART',
  // Selection buffer actions
  TOGGLE_STYLE = 'TOGGLE_STYLE',
  TOGGLE_GROUP = 'TOGGLE_GROUP',
  SET_STYLE_LICENSE_TYPES = 'SET_STYLE_LICENSE_TYPES',
  HYDRATE_SELECTIONS = 'HYDRATE_SELECTIONS',
  CLEAR_SELECTIONS = 'CLEAR_SELECTIONS',
  SET_COMMITTED = 'SET_COMMITTED',
  CLEAR_COMMITTED = 'CLEAR_COMMITTED',
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
        licenseSize: LicenseSize
      }
    }
  | {
      type: ActionType.SET_LICENSE_TYPES
      payload: {
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
  | {
      type: ActionType.TOGGLE_STYLE
      payload: {
        parentUid: string
        skuCode: string
        styleMetadata: StyleEntry
      }
    }
  | {
      type: ActionType.TOGGLE_GROUP
      payload: {
        parentUid: string
        styles: { skuCode: string; styleMetadata: StyleEntry }[]
      }
    }
  | {
      type: ActionType.SET_STYLE_LICENSE_TYPES
      payload: {
        parentUid: string
        skuCode: string
        licenseTypes: string[]
      }
    }
  | {
      type: ActionType.HYDRATE_SELECTIONS
      payload: {
        selections: SelectionBuffer
      }
    }
  | { type: ActionType.CLEAR_SELECTIONS }
  | {
      type: ActionType.SET_COMMITTED
      payload: {
        committedSelectionsHash: string
      }
    }
  | { type: ActionType.CLEAR_COMMITTED }

/** Count total styles across all parentUid groups */
function countSelections(selections: SelectionBuffer): number {
  return Object.values(selections).reduce(
    (total, group) => total + Object.keys(group).length,
    0
  )
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
        hasLicenseOwner: action.payload.others.hasLicenseOwner,
        isLicenseForClient: action.payload.others.isLicenseForClient,
        licenseOwner: action.payload.others.licenseOwner,
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
        licenseSize: action.payload.licenseSize,
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
        ...action.payload.others,
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
    // --- Selection buffer actions ---
    case ActionType.TOGGLE_STYLE: {
      const { parentUid, skuCode, styleMetadata } = action.payload
      const group = state.selections[parentUid] ?? {}
      let updatedGroup: typeof group

      if (group[skuCode]) {
        // Remove style
        const { [skuCode]: _, ...rest } = group
        updatedGroup = rest
      } else {
        // Add style
        updatedGroup = { ...group, [skuCode]: styleMetadata }
      }

      // Remove empty groups
      const updatedSelections =
        Object.keys(updatedGroup).length === 0
          ? (({ [parentUid]: _, ...rest }) => rest)(state.selections)
          : { ...state.selections, [parentUid]: updatedGroup }

      return {
        ...state,
        selections: updatedSelections,
        itemsCount: countSelections(updatedSelections),
      }
    }
    case ActionType.TOGGLE_GROUP: {
      const { parentUid, styles } = action.payload
      const group = state.selections[parentUid] ?? {}

      // If all styles are already selected, remove them all; otherwise add them all
      const allSelected = styles.every(({ skuCode }) => !!group[skuCode])

      let updatedSelections: SelectionBuffer
      if (allSelected) {
        // Remove all styles in the group
        const { [parentUid]: _, ...rest } = state.selections
        updatedSelections = rest
      } else {
        // Add all styles to the group
        const updatedGroup = { ...group }
        for (const { skuCode, styleMetadata } of styles) {
          updatedGroup[skuCode] = styleMetadata
        }
        updatedSelections = { ...state.selections, [parentUid]: updatedGroup }
      }

      return {
        ...state,
        selections: updatedSelections,
        itemsCount: countSelections(updatedSelections),
      }
    }
    case ActionType.SET_STYLE_LICENSE_TYPES: {
      const { parentUid, skuCode, licenseTypes } = action.payload
      const group = state.selections[parentUid]
      if (!group?.[skuCode]) return state

      return {
        ...state,
        selections: {
          ...state.selections,
          [parentUid]: {
            ...group,
            [skuCode]: { ...group[skuCode], licenseTypes },
          },
        },
      }
    }
    case ActionType.HYDRATE_SELECTIONS: {
      const { selections } = action.payload
      return {
        ...state,
        selections,
        itemsCount: countSelections(selections),
      }
    }
    case ActionType.CLEAR_SELECTIONS: {
      return {
        ...state,
        selections: {},
        itemsCount: 0,
        isCommitted: false,
        committedSelectionsHash: '',
      }
    }
    case ActionType.SET_COMMITTED: {
      return {
        ...state,
        isCommitted: true,
        committedSelectionsHash: action.payload.committedSelectionsHash,
      }
    }
    case ActionType.CLEAR_COMMITTED: {
      return {
        ...state,
        isCommitted: false,
        committedSelectionsHash: '',
      }
    }
    default:
      throw new Error(`Unknown action type`)
  }
}
