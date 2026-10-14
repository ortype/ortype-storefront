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
  /** The license buffer finished hydrating; persistence may start */
  LICENSE_HYDRATED = 'LICENSE_HYDRATED',
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
  | { type: ActionType.LICENSE_HYDRATED }
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
        clientLicenseOwner: undefined,
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
      const incoming = action.payload.others.licenseOwner
      const current = state.licenseOwner
      const wasClient = current?.is_client === true
      const willBeClient = (incoming.is_client ?? current?.is_client) === true

      // The two holders have different details — "Yourself" is the buyer's
      // billing address (written at checkout), "Your client" is an address of
      // its own — so the client's are kept in their own buffer. Merging the
      // shapes used to leave the client's address on the order flagged as
      // `is_client: false` after switching to "Yourself".
      const clientLicenseOwner: LicenseOwnerInput | undefined = willBeClient
        ? {
            ...state.clientLicenseOwner,
            ...(wasClient ? current : {}),
            ...incoming,
            is_client: true,
          }
        : wasClient
          ? { ...state.clientLicenseOwner, ...current }
          : state.clientLicenseOwner

      // Within one holder, partial updates from the radio (is_client only) and
      // the company input (company only) still merge, so they don't clobber
      // each other.
      const licenseOwner: LicenseOwnerInput = willBeClient
        ? (clientLicenseOwner as LicenseOwnerInput)
        : wasClient
          ? // Switching to "Yourself": the client's details are parked in
            // `clientLicenseOwner`, and the owner is completed from the
            // billing address on the checkout license step.
            { is_client: incoming.is_client ?? null }
          : { ...current, ...incoming }
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
        clientLicenseOwner,
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
    case ActionType.LICENSE_HYDRATED: {
      return {
        ...state,
        licenseHydrated: true,
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
