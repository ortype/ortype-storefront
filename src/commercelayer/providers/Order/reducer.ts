import {
  LicenseOwnerInput,
  OrderStateData,
} from '@/commercelayer/providers/Order'
import {
  toggleStyleInGroup,
  toggleStylesInGroup,
  withGroup,
  type StyleGroup,
} from './selection-utils'
import type {
  CommittedGroups,
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
  StyleEntry,
} from './types'
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
  // Group-level commit tracking
  SET_COMMITTED_GROUP = 'SET_COMMITTED_GROUP',
  REMOVE_COMMITTED_GROUP = 'REMOVE_COMMITTED_GROUP',
  HYDRATE_COMMITTED_GROUPS = 'HYDRATE_COMMITTED_GROUPS',
  CLEAR_ALL_COMMITTED = 'CLEAR_ALL_COMMITTED',
  // Per-font selection management
  SET_FONT_SELECTIONS = 'SET_FONT_SELECTIONS',
  // Group resolution tracking (for hybrid projection)
  REGISTER_GROUP_RESOLUTIONS = 'REGISTER_GROUP_RESOLUTIONS',
  HYDRATE_GROUP_RESOLUTIONS = 'HYDRATE_GROUP_RESOLUTIONS',
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
        // Only the (partial) owner is sent; the reducer merges it with the
        // existing owner and derives hasLicenseOwner / isLicenseForClient.
        others: {
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
        styles: {
          skuCode: string
          styleMetadata: StyleEntry
        }[]
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
      type: ActionType.SET_COMMITTED_GROUP
      payload: {
        parentUid: string
        hash: string
        lineItemIds: string[]
        size?: LicenseSize
      }
    }
  | {
      type: ActionType.REMOVE_COMMITTED_GROUP
      payload: {
        parentUid: string
      }
    }
  | {
      type: ActionType.HYDRATE_COMMITTED_GROUPS
      payload: {
        committedGroups: CommittedGroups
      }
    }
  | { type: ActionType.CLEAR_ALL_COMMITTED }
  | {
      type: ActionType.SET_FONT_SELECTIONS
      payload: { parentUid: string; group: StyleGroup }
    }
  | {
      type: ActionType.REGISTER_GROUP_RESOLUTIONS
      payload: {
        parentUid: string
        groups: ResolvedFontGroup[]
      }
    }
  | {
      type: ActionType.HYDRATE_GROUP_RESOLUTIONS
      payload: {
        groupResolutions: GroupResolutions
      }
    }

export function reducer(
  state: OrderStateData,
  action: Action
): OrderStateData {
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
      // Merge with the existing owner so partial updates from the radio
      // (is_client only) and the company input (company only) don't clobber
      // each other.
      const licenseOwner: LicenseOwnerInput = {
        ...state.licenseOwner,
        ...action.payload.others.licenseOwner,
      }
      const hasLicenseOwnerType = typeof licenseOwner.is_client === 'boolean'
      const isLicenseForClient = licenseOwner.is_client === true
      // "Yourself" needs no name; "Your client" requires a license owner /
      // company name before the license info is considered complete.
      const hasLicenseOwner =
        hasLicenseOwnerType &&
        (isLicenseForClient ? !!licenseOwner.company?.trim() : true)
      return {
        ...state,
        hasLicenseOwner,
        isLicenseForClient,
        licenseOwner,
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
      const updatedGroup = toggleStyleInGroup(
        state.selections[parentUid] ?? {},
        skuCode,
        styleMetadata
      )
      return {
        ...state,
        selections: withGroup(state.selections, parentUid, updatedGroup),
      }
    }
    case ActionType.TOGGLE_GROUP: {
      const { parentUid, styles } = action.payload
      const updatedGroup = toggleStylesInGroup(
        state.selections[parentUid] ?? {},
        styles
      )
      return {
        ...state,
        selections: withGroup(state.selections, parentUid, updatedGroup),
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
      }
    }
    case ActionType.CLEAR_SELECTIONS: {
      return {
        ...state,
        selections: {},
        committedGroups: {},
      }
    }
    case ActionType.SET_COMMITTED_GROUP: {
      const { parentUid, hash, lineItemIds, size } = action.payload
      return {
        ...state,
        committedGroups: {
          ...state.committedGroups,
          [parentUid]: { hash, lineItemIds, size },
        },
      }
    }
    case ActionType.REMOVE_COMMITTED_GROUP: {
      const { [action.payload.parentUid]: _, ...rest } = state.committedGroups
      return {
        ...state,
        committedGroups: rest,
      }
    }
    case ActionType.HYDRATE_COMMITTED_GROUPS: {
      return {
        ...state,
        committedGroups: action.payload.committedGroups,
      }
    }
    case ActionType.CLEAR_ALL_COMMITTED: {
      return {
        ...state,
        committedGroups: {},
      }
    }
    case ActionType.SET_FONT_SELECTIONS: {
      // Replaces one font's selections; an empty group removes the entry.
      const { parentUid, group } = action.payload
      return {
        ...state,
        selections: withGroup(state.selections, parentUid, group),
      }
    }
    case ActionType.REGISTER_GROUP_RESOLUTIONS: {
      const { parentUid, groups } = action.payload
      return {
        ...state,
        groupResolutions: {
          ...state.groupResolutions,
          [parentUid]: groups,
        },
      }
    }
    case ActionType.HYDRATE_GROUP_RESOLUTIONS: {
      return {
        ...state,
        groupResolutions: action.payload.groupResolutions,
      }
    }
    default:
      throw new Error(`Unknown action type`)
  }
}
