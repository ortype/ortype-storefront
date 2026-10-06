import type { Order, SkuOption } from '@commercelayer/sdk'
import type {
  GroupResolutions,
  LicenseOwnerInput,
  LicenseSize,
  OrderStateData,
  ResolvedFontGroup,
} from './types'

export enum ActionType {
  START_LOADING = 'START_LOADING',
  STOP_LOADING = 'STOP_LOADING',
  SET_ORDER = 'SET_ORDER',
  /** Back to "no order" (e.g. the order was placed): clears order + license buffer */
  RESET_ORDER = 'RESET_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  CREATE_ORDER = 'CREATE_ORDER',
  SET_LICENSE_OWNER = 'SET_LICENSE_OWNER',
  SET_LICENSE_SIZE = 'SET_LICENSE_SIZE',
  SET_LICENSE_TYPES = 'SET_LICENSE_TYPES',
  SET_SKU_OPTIONS = 'SET_SKU_OPTIONS',
  // Group resolution tracking (for hybrid projection).
  // Cart selections and committed groups are NOT reducer state: they are
  // derived from the order's line items (see ./utils/derive-selections.ts).
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
  | { type: ActionType.RESET_ORDER }
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
        licenseSize?: LicenseSize
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
    case ActionType.RESET_ORDER: {
      return {
        ...state,
        order: undefined,
        orderId: undefined,
        isInvalid: false,
        licenseOwner: undefined,
        hasLicenseOwner: false,
        isLicenseForClient: false,
        licenseSize: undefined,
        hasValidLicenseSize: false,
        hasValidLicenseType: false,
        allLicenseInfoSet: false,
        selectedSkuOptions: [],
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
