import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { CLayerClientConfig } from '@/commercelayer/providers/identity/types'
import {
  ActionType,
  reducer,
  type Action,
} from '@/commercelayer/providers/Order/reducer'
import utils, {
  calculateSettings,
} from '@/commercelayer/providers/Order/utils'
import type { ClonePayload } from '@/commercelayer/utils/cart-share'
import { forceOrderAutorefresh } from '@/commercelayer/utils/forceOrderAutorefresh'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { calculateLineItemPrice } from '@/commercelayer/utils/prices'
import { retryCall } from '@/commercelayer/utils/retryCall'
import {
  type BuyLabels,
  type CartLabels,
  type CompanySize,
  type LicenseMetrics,
  type MediaType,
  type UiLabels,
} from '@/sanity/lib/queries'
import { OrderUpdate, SkuOption, type Order } from '@commercelayer/sdk'
import type { ChildrenElement } from 'CustomApp'
import { getOrder } from './utils/getOrder'

import { toaster } from '@/components/ui/toaster'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import {
  allCartLineItemIds,
  applySelectionOverlay,
  deriveCommittedGroups,
  deriveGroupResolutionsFromOrder,
  deriveSelectionsFromOrder,
  isCommittedSizeStale,
  lineItemIdsForFont,
  mergeGroupResolutions,
} from './derive-selections'
import { createMutationQueue } from './mutation-queue'
import {
  countSelections,
  pickSkuOptions,
  skuOptionRefs,
  type StyleGroup,
} from './selection-utils'
import { OrderStorageContext } from './Storage'
import type {
  CommittedGroups,
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
} from './types'

/*
1. Clean separation between utils and provider:
•  Utils handles core API interactions
•  Provider manages state and orchestrates the flow
•  Proper error typing and handling in both layers
2. Strong TypeScript implementation:
•  Well-defined types for OrderMetadata and OrderAttributes
•  Proper error type definitions
•  Consistent use of success/error return types
3. Good error handling patterns:
•  Consistent try/catch blocks
•  Proper error logging in development
•  Clear error messages
*/

export type LicenseOwnerInput = Pick<LicenseOwner, 'is_client' | 'company'>

export type {
  CommittedGroups,
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
  StyleEntry,
} from './types'

interface UpdateOrderArgs {
  id: string
  attributes: Omit<OrderUpdate, 'id'>
  include?: string[]
}

// Add type definitions for metadata and attributes
type OrderMetadata = {
  license?: {
    owner?: LicenseOwnerInput
    size?: LicenseSize
    types?: string[]
  }
  [key: string]: any
}

type OrderAttributes = {
  [key: string]: any
}

export interface AddToCartError {
  message: string
  originalError?: unknown
}

export interface AddToCartResult {
  success: boolean
  error?: AddToCartError
  order?: Order
  orderId?: string
}

type OrderProviderData = {
  order?: Order
  orderId?: string
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  companySizes: CompanySize[]
  mediaTypes: MediaType[]
  buyLabels?: BuyLabels
  cartLabels?: CartLabels
  licenseSize: LicenseSize
  createOrder: (params?: {
    customMetadata?: Record<string, any>
    customAttributes?: Record<string, any>
  }) => Promise<AddToCartResult>
  refetchOrder: () => Promise<{
    success: boolean
    order?: Order
  }>
  updateOrder: (params: UpdateOrderArgs) => Promise<{
    success: boolean
    error?: AddToCartError
    order?: Order
  }>
  hasLicenseOwner: boolean
  isLicenseForClient: boolean
  licenseOwner?: LicenseOwnerInput
  hasValidLicenseSize: boolean
  hasValidLicenseType: boolean
  allLicenseInfoSet: boolean
  hasLineItems: boolean
  setLicenseOwner: (params: { licenseOwner?: LicenseOwnerInput }) => void
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  /**
   * The styles in the cart, per font. DERIVED from `order.line_items` (the
   * order is the source of truth) with in-flight cart edits overlaid.
   */
  selections: SelectionBuffer
  /** Per-font signature / line item ids / priced size, derived from the order */
  committedGroups: CommittedGroups
  /** The order has line items, no write is pending, and no font is priced at a stale size */
  isFullyCommitted: boolean
  /** A cart write is queued or running, or an optimistic edit is unsettled */
  hasPendingWrites: boolean
  /** Some committed font was priced at a different license size than the current one */
  isSizeStale: boolean
  /** Fonts with an unsettled cart-page edit (for per-font pending UI) */
  pendingFonts: string[]
  /**
   * Cart-page edit: remove styles from a font. Writes through to Commerce
   * Layer (optimistically reflected in `selections` meanwhile).
   */
  removeStyles: (params: {
    parentUid: string
    skuCodes: string[]
  }) => Promise<{ success: boolean; error?: AddToCartError }>
  /** Cart-page edit: remove a whole font. Writes through like `removeStyles`. */
  removeFont: (
    parentUid: string
  ) => Promise<{ success: boolean; error?: AddToCartError }>
  /** Cart-page edit: change one style's license types. Writes through. */
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => Promise<{ success: boolean; error?: AddToCartError }>
  /**
   * Commit `group` (a font's draft selections) to CL line items. The refetched
   * order then drives `selections`; `options.licenseTypes` is promoted to the
   * order-wide default license types.
   */
  commitGroup: (
    parentUid: string,
    group: StyleGroup,
    options?: { licenseTypes?: string[] }
  ) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /** Remove a font from the cart (deletes its committed line items) */
  removeGroup: (parentUid: string) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /**
   * Reprice every font whose line items were priced at a different license
   * size than the current one (a recommit per stale font).
   */
  repriceAll: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /**
   * Resolve once the cart is settled: the debounced license metadata write has
   * been flushed and every queued cart write has finished.
   */
  flushPendingWrites: () => Promise<void>
  clearCommittedItems: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /**
   * Replace the whole cart with a cloned one (see `/cart/clone/[token]`):
   * clears the existing line items, registers the payload's group resolutions
   * and license info, defaults the license holder to "Yourself" when unset,
   * then creates the order if needed and commits every font to Commerce Layer.
   */
  importSelections: (payload: ClonePayload) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /** Resolved style groups per parentUid, for hybrid projection */
  groupResolutions: GroupResolutions
  /** Register resolved groups for a font (called by BuyProvider on mount) */
  registerGroupResolutions: (
    parentUid: string,
    groups: ResolvedFontGroup[]
  ) => void
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  setSelectedSkuOptions: (params: {
    font: any // @TODO: font type
    selectedSkuOptions: SkuOption[]
  }) => void
}

export type OrderStateData = {
  order?: Order
  orderId?: string
  licenseOwner?: LicenseOwnerInput // Make optional
  hasLicenseOwner: boolean // Required, with boolean type
  isLicenseForClient: boolean // Required, with boolean type
  hasValidLicenseSize: boolean // Whether licenseSize is valid
  hasValidLicenseType: boolean // Whether license type is valid
  allLicenseInfoSet: boolean // Whether all license info is set
  hasLineItems: boolean // Whether the order has line items
  licenseSize?: LicenseSize // Make optional
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  isLoading: boolean
  isInvalid: boolean
  /** Resolutions registered by the buy page (cache); see `groupResolutions` for the effective set */
  groupResolutions: GroupResolutions
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  licenseOwner: undefined,
  hasLicenseOwner: false,
  isLicenseForClient: false,
  hasValidLicenseSize: false,
  hasValidLicenseType: false,
  allLicenseInfoSet: false,
  hasLineItems: false,
  licenseSize: undefined,
  selectedSkuOptions: [],
  skuOptions: [],
  isLoading: true,
  isInvalid: false,
  groupResolutions: {},
}

const OrderContext = createContext<OrderProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as OrderProviderData
)

export const useOrderContext = (): OrderProviderData =>
  useContext(OrderContext)

type OrderProviderProps = {
  config: CLayerClientConfig
  labels?: UiLabels | null
  metrics: LicenseMetrics
  children: ((props: OrderProviderData) => ChildrenElement) | ChildrenElement
}

/** How long a license edit waits before it is written to the order */
const LICENSE_WRITE_DEBOUNCE_MS = 800

type CartWriteResult = { success: boolean; error?: AddToCartError }

const toWriteError = (error: unknown, fallback: string): AddToCartError => ({
  message: error instanceof Error ? error.message : fallback,
  originalError: error,
})

/** The license buffer as stored in `order.metadata.license` (defined fields only) */
const licenseMetadataOf = (
  s: Pick<
    OrderStateData,
    'licenseOwner' | 'licenseSize' | 'selectedSkuOptions'
  >
) => ({
  ...(s.licenseOwner ? { owner: s.licenseOwner } : {}),
  ...(s.licenseSize ? { size: s.licenseSize } : {}),
  types: skuOptionRefs(s.selectedSkuOptions),
})

/** Stable form used to tell whether the order already has this license */
const serializeLicense = (license: object): string => JSON.stringify(license)

/**
 * Group resolutions in effect: those registered by the buy page (and cached in
 * localStorage), backed up by the groups already present on the order, so a
 * fresh device keeps full groups intact when it recommits a font.
 */
const effectiveGroupResolutions = (
  s: Pick<OrderStateData, 'order' | 'groupResolutions'>
): GroupResolutions =>
  mergeGroupResolutions(
    deriveGroupResolutionsFromOrder(s.order),
    s.groupResolutions
  )

export function OrderProvider({
  children,
  config,
  labels,
  metrics,
  metadata,
  attributes,
}: OrderProviderProps): JSX.Element {
  const [state, rawDispatch] = useReducer(reducer, initialState)
  // The latest reducer state, updated *synchronously* on every dispatch.
  // Queued Commerce Layer writes run later than the render that scheduled
  // them, so they read from this ref (never from render-time closures) to
  // always see the current order, license size and group resolutions.
  const stateRef = useRef(state)
  const dispatch = useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action)
    rawDispatch(action)
  }, [])

  // Every cart write toggles `autorefresh` on the same order and refetches it,
  // so they are serialized through one queue (see mutation-queue.ts).
  const [queue] = useState(createMutationQueue)
  const [queueSize, setQueueSize] = useState(0)
  useEffect(() => queue.subscribe(() => setQueueSize(queue.size())), [queue])

  // Optimistic cart-page edits, keyed by font, until their write settles.
  // An empty group means "pending removal".
  const [overlay, setOverlay] = useState<{ [parentUid: string]: StyleGroup }>(
    {}
  )
  const overlayRef = useRef(overlay)
  // Latest edit per font; an older edit must not settle a newer one's overlay
  const intentTokenRef = useRef<Record<string, number>>({})

  // License buffer persistence bookkeeping
  // Guards persistence so we never write the empty initial state
  const licenseInitializedRef = useRef(false)
  // Serialized license metadata last known to be on the order
  const lastLicenseHashRef = useRef('')
  const licenseWriteTimerRef =
    useRef<ReturnType<typeof setTimeout>>(undefined)

  // Seeded once from server-fetched Sanity metrics (Providers → layout)
  const [companySizes] = useState<CompanySize[]>(metrics.sizes)
  const [mediaTypes] = useState<MediaType[]>(metrics.media)

  // Order persistence is handled through OrderStorageContext
  // using getLocalOrder/setLocalOrder for consistent storage management

  // Order creation is handled through createOrder method
  // following our Provider/Reducer/Utils pattern

  const {
    persistKey = 'order',
    clearWhenPlaced,
    getLocalOrder,
    setLocalOrder,
    deleteLocalOrder,
  } = useContext(OrderStorageContext)

  const createOrder = useCallback(
    async (params?: {
      customMetadata?: OrderMetadata
      customAttributes?: OrderAttributes
    }): Promise<AddToCartResult> => {
      // Early return if we already have an order ID. Read from the ref, not a
      // render-time closure, so back-to-back callers never create two orders.
      const current = stateRef.current
      if (current.orderId) {
        return {
          success: true,
          orderId: current.orderId,
          order: current.order,
        }
      }

      dispatch({ type: ActionType.START_LOADING })
      const cl = isValidCommerceLayerConfig(config)
        ? getCommerceLayer(config)
        : undefined

      try {
        if (cl == null) {
          throw new Error('Commerce Layer client not initialized')
        }

        // Combine default metadata/attributes with custom ones if provided
        const mergedMetadata: OrderMetadata = {
          license: {
            ...(metadata?.license || {}),
            ...(params?.customMetadata?.license || {}),
          },
          ...(metadata || {}),
          ...(params?.customMetadata || {}),
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] createOrder: mergedMetadata:', {
            metadata,
            customMetadata: params?.customMetadata,
            merged: mergedMetadata,
          })
        }

        const mergedAttributes: OrderAttributes = {
          ...attributes,
          ...params?.customAttributes,
        }

        // Create the order using the utility function
        const result = await utils.createOrder({
          config,
          metadata: mergedMetadata,
          attributes: mergedAttributes,
        })

        if (!result.success || !result.order) {
          return { success: false, error: result.error }
        }

        const order = result.order
        const orderId = order.id

        // Store the order ID in localStorage if persistKey is provided
        if (persistKey && setLocalOrder) {
          setLocalOrder(persistKey, orderId)
        }

        // Calculate additional settings based on the order
        const orderSettings = calculateSettings(order)

        // Dispatch the CREATE_ORDER action
        dispatch({
          type: ActionType.CREATE_ORDER,
          payload: {
            order,
            orderId,
            others: {
              isInvalid: false,
              ...orderSettings,
            },
          },
        })

        return { success: true, order, orderId }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error creating order:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create order',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, metadata, attributes, persistKey, setLocalOrder, dispatch]
  )

  const fetchOrder = useCallback(
    async (params?: {
      orderId?: string
      /**
       * Also (re)hydrate the license buffer (owner / size / types) from the
       * order's metadata. Only the initial load should: on later refetches the
       * in-memory license state may hold edits that have not been written yet.
       */
      hydrateLicense?: boolean
    }): Promise<{
      success: boolean
      order?: Order // Assuming Order is your type for order object
    }> => {
      const orderId =
        params?.orderId ??
        (persistKey ? getLocalOrder(persistKey) : undefined)
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!orderId || cl == null) {
          return { success: false }
        }
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] fetchOrder: ', orderId)
        }
        const orderResponse = await getOrder({
          client: cl,
          orderId,
        })
        const order = orderResponse?.object

        // If clearWhenPlaced is enabled and the order has been placed (not editable),
        // clear it from localStorage and reset state
        const shouldClearPlacedOrder = !!(persistKey && clearWhenPlaced)
        if (shouldClearPlacedOrder && order && order.editable === false) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              '[OrderProvider] fetchOrder: Order has been placed, clearing all cart state',
              { orderId, persistKey }
            )
          }
          // Clear order ID from localStorage
          deleteLocalOrder(persistKey)
          // Clear the remaining cart-related localStorage keys
          try {
            localStorage.removeItem(`${persistKey}_group_resolutions`)
            localStorage.removeItem(`${persistKey}_license`)
          } catch {
            /* localStorage unavailable */
          }
          lastLicenseHashRef.current = ''
          // Reset provider state: order (the cart is derived from it), license
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order: undefined,
              others: {
                orderId: undefined,
                isInvalid: false,
                hasLicenseOwner: false,
                isLicenseForClient: false,
                licenseOwner: undefined,
                hasValidLicenseSize: false,
                hasValidLicenseType: false,
                allLicenseInfoSet: false,
                licenseSize: undefined,
                selectedSkuOptions: [],
              },
            },
          })
          return { success: true, order: undefined }
        }

        // Handle order metadata after initial creation
        if (order && !order.metadata?.license) {
          const settings = calculateSettings(order)
          order.metadata = {
            license: {
              size: settings.licenseSize,
              types: settings.types || [], // Initialize types array
            },
          }
        }

        // @NOTE: consider these utils for checking the orderId and order object
        // import { isValidOrderIdFormat } from '@/utils/isValidOrderIdFormat'
        // if (!isValidOrderIdFormat(orderId)) {
        // console.log('Invalid: Order Id format')
        // import { isValidStatus } from '@/utils/isValidStatus'
        // if (!isValidStatus(order.status)) {
        // console.log('Invalid: Order status')

        order &&
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order,
              others: {
                isInvalid: !order,
                orderId,
                ...(params?.hydrateLicense ? calculateSettings(order) : {}),
              },
            },
          })
        return { success: true, order }
      } catch (error) {
        return { success: false }
      }
    },
    [
      config,
      persistKey,
      clearWhenPlaced,
      getLocalOrder,
      deleteLocalOrder,
      dispatch,
    ]
  )

  const updateOrder = useCallback(
    async ({
      id,
      attributes,
      include,
    }: UpdateOrderArgs): Promise<{
      success: boolean
      error?: AddToCartError // Update to use same error type
      order?: Order
    }> => {
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (cl == null) {
          return { success: false }
        }

        const resource = { ...attributes, id }
        await cl.orders.update(resource, { include })
        const { order } = await fetchOrder()

        order &&
          dispatch({
            type: ActionType.UPDATE_ORDER,
            payload: {
              order,
            },
          })

        return { success: true, order }
      } catch (error) {
        // Remove : any type
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error updating order:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update order',
            originalError: error,
          },
        }
      }
    },
    [config, fetchOrder, dispatch]
  )

  const fetchSkuOptions = useCallback(
    async (
      existingTypes: string[] = [],
      mediaTypes: MediaType[] = []
    ): Promise<{
      success: boolean
      error?: AddToCartError
    }> => {
      dispatch({ type: ActionType.START_LOADING })
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!cl) {
          throw new Error('Commerce Layer client not initialized')
        }

        let skuOptions = await cl.sku_options.list()

        // Sort sku_options to match the order defined in Sanity media types
        if (mediaTypes.length > 0) {
          const mediaKeyOrder = new Map(mediaTypes.map((m, i) => [m._key, i]))
          skuOptions.sort((a, b) => {
            const aIdx = mediaKeyOrder.get(a.reference) ?? Infinity
            const bIdx = mediaKeyOrder.get(b.reference) ?? Infinity
            return aIdx - bIdx
          })
        }

        // Find matching sku options for existing types
        const existingSelectedOptions = skuOptions.filter((option) =>
          existingTypes.includes(option.reference)
        )

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] 🎯 fetchSkuOptions: Processing types and options:',
            {
              existingTypes,
              matchingOptions: existingSelectedOptions.map((opt) => ({
                id: opt.id,
                name: opt.name,
                reference: opt.reference,
              })),
              allOptionsCount: skuOptions.length,
              allOptionsReferences: skuOptions.map((opt) => opt.reference),
            }
          )
        }

        dispatch({
          type: ActionType.SET_SKU_OPTIONS,
          payload: {
            skuOptions,
            others: {
              selectedSkuOptions: existingSelectedOptions,
              hasValidLicenseType: existingSelectedOptions.length > 0,
            },
          },
        })
        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching SKU options:', error)
        }
        return {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch SKU options',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, dispatch]
  ) // Only depend on config, not on state

  // Pure state update. Persistence to Commerce Layer is handled by the small
  // debounced license-metadata write below (once an order exists) and by
  // `ensureOrder` (which creates the order on the first commit).
  const setLicenseOwner = useCallback(
    (params: { licenseOwner?: LicenseOwnerInput }): void => {
      const licenseOwner = params.licenseOwner
      if (!licenseOwner) return

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] setLicenseOwner (state-only):',
          licenseOwner
        )
      }

      dispatch({
        type: ActionType.SET_LICENSE_OWNER,
        payload: {
          others: {
            licenseOwner,
          },
        },
      })
    },
    [dispatch]
  )

  // Pure state update (see setLicenseOwner note on persistence).
  const setLicenseSize = useCallback(
    (params: { licenseSize?: LicenseSize }): void => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] setLicenseSize (state-only):',
          params.licenseSize
        )
      }

      dispatch({
        type: ActionType.SET_LICENSE_SIZE,
        payload: { licenseSize: params.licenseSize },
      })
    },
    [dispatch]
  )

  // Pure state update (see setLicenseOwner note on persistence). Sets the
  // order-wide DEFAULT license types only. The buy dialog edits its own
  // per-font draft (BuyProvider) and promotes the types here on save via
  // `commitGroup`. `font` is accepted for caller compatibility.
  const setSelectedSkuOptions = useCallback(
    (params: { selectedSkuOptions: SkuOption[]; font: any }): void => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] setSelectedSkuOptions (state-only):', {
          font: params.font?.shortName,
          selectedSkuOptions: params.selectedSkuOptions,
        })
      }

      dispatch({
        type: ActionType.SET_LICENSE_TYPES,
        payload: {
          others: {
            selectedSkuOptions: params.selectedSkuOptions,
            hasValidLicenseType: params.selectedSkuOptions.length > 0,
          },
        },
      })
    },
    [dispatch]
  )

  const refetchOrder = useCallback(async (): Promise<{
    success: boolean
    order?: Order
  }> => {
    return await fetchOrder()
  }, [fetchOrder])

  // Create a stable initialization function
  const initializeProvider = useCallback(async () => {
    if (!config.accessToken) return

    dispatch({ type: ActionType.START_LOADING })
    try {
      // The order (with its line items) is the source of truth for the cart,
      // so there is nothing to hydrate for selections. This is the only fetch
      // that also hydrates the license buffer from the order's metadata.
      const { order, success } = await fetchOrder({ hydrateLicense: true })

      // Always fetch SKU options, passing existing license types if order exists
      let existingTypes: string[] = []

      // Selections used to be mirrored here; drop the stale legacy keys
      // (see ./archive for the retired sync).
      try {
        localStorage.removeItem(`${persistKey}_selections`)
        localStorage.removeItem(`${persistKey}_committed_groups`)
      } catch {
        /* localStorage unavailable */
      }

      // Cached group resolutions (Sanity-derived; registered by the buy page)
      try {
        const storedResolutions = localStorage.getItem(
          `${persistKey}_group_resolutions`
        )
        if (storedResolutions) {
          const parsed = JSON.parse(storedResolutions) as GroupResolutions
          if (Object.keys(parsed).length > 0) {
            dispatch({
              type: ActionType.HYDRATE_GROUP_RESOLUTIONS,
              payload: { groupResolutions: parsed },
            })
          }
        }
      } catch {
        /* localStorage unavailable or corrupted */
      }

      if (success && order) {
        // If order is found, use its license types
        existingTypes = order.metadata?.license?.types || []

        // What Commerce Layer already has, so the license write effect only
        // fires for real changes
        lastLicenseHashRef.current = serializeLicense({
          owner: order.metadata?.license?.owner,
          size: order.metadata?.license?.size,
          types: existingTypes,
        })

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[Order Provider] 🔄 initializeProvider: Found existing order with types:',
            {
              orderId: order.id,
              existingTypes,
              fullMetadata: order.metadata,
              licenseMetadata: order.metadata?.license,
            }
          )
        }
      } else {
        // No order yet — hydrate the license buffer from localStorage so partial
        // progress entered before order creation survives a reload.
        try {
          const storedLicense = localStorage.getItem(`${persistKey}_license`)
          if (storedLicense) {
            const parsed = JSON.parse(storedLicense) as {
              owner?: LicenseOwnerInput
              size?: LicenseSize
              types?: string[]
            }

            if (parsed.owner) {
              dispatch({
                type: ActionType.SET_LICENSE_OWNER,
                payload: {
                  others: {
                    licenseOwner: parsed.owner,
                  },
                },
              })
            }

            if (parsed.size?.value) {
              dispatch({
                type: ActionType.SET_LICENSE_SIZE,
                payload: { licenseSize: parsed.size },
              })
            }

            if (Array.isArray(parsed.types) && parsed.types.length > 0) {
              // fetchSkuOptions below maps these references back to SkuOptions
              existingTypes = parsed.types
            }
          }
        } catch {
          // localStorage unavailable or corrupted — ignore
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[Order Provider] 🔄 initializeProvider: No existing order found',
            {
              success,
              hasOrder: !!order,
              existingTypes,
            }
          )
        }
      }

      // License buffer is now hydrated (order metadata seeds it via SET_ORDER, or
      // localStorage above); enable persistence for subsequent changes.
      licenseInitializedRef.current = true

      // Reconcile stale licenseSize with current Sanity data.
      // Metrics are server-fetched and provided via props (Providers → layout),
      // so no client-side Sanity fetch is needed here.
      const storedSize = order?.metadata?.license?.size
      if (storedSize?.value && metrics.sizes.length > 0) {
        const sanitySize = metrics.sizes.find(
          (s) => s.value === storedSize.value
        )
        if (
          sanitySize &&
          (sanitySize.modifier !== storedSize.modifier ||
            sanitySize.label !== storedSize.label)
        ) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              '[OrderProvider] 🔄 initializeProvider: Reconciling stale licenseSize',
              {
                stored: storedSize,
                sanity: sanitySize,
              }
            )
          }
          setLicenseSize({
            licenseSize: {
              label: sanitySize.label,
              value: sanitySize.value,
              modifier: sanitySize.modifier,
            },
          })
        }
      }

      const skuResult = await fetchSkuOptions(existingTypes, metrics.media)

      if (!skuResult.success) {
        console.warn('Failed to fetch SKU options during initialization')
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] ✅ initializeProvider: Initialized with',
          {
            skuOptions: skuResult.success,
            companySizes: metrics.sizes.length,
            mediaTypes: metrics.media.length,
          }
        )
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error during provider initialization:', error)
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [config.accessToken, fetchOrder, fetchSkuOptions, dispatch])

  // Update the useEffect to use the stable initialization function
  useEffect(() => {
    initializeProvider()
  }, [initializeProvider])

  // --- License buffer persistence ---
  // Cart *selections* are not persisted here: the order's line items are the
  // source of truth. Only the order-wide license buffer is (owner / size /
  // default types), because it is chosen before the order exists and has no
  // draft / commit step of its own.

  // Before an order exists: localStorage, so partial license info survives a
  // reload. Once the order exists its metadata is the source of truth.
  const LICENSE_STORAGE_KEY = `${persistKey}_license`
  useEffect(() => {
    if (!licenseInitializedRef.current || state.orderId) return
    try {
      const serialized = JSON.stringify({
        owner: state.licenseOwner,
        size: state.licenseSize,
        types: state.selectedSkuOptions.map((o) => o.reference),
      })
      localStorage.setItem(LICENSE_STORAGE_KEY, serialized)
    } catch {
      // localStorage unavailable (SSR, private browsing quota, etc.)
    }
  }, [
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    state.orderId,
    LICENSE_STORAGE_KEY,
  ])

  /**
   * Write the license buffer to `order.metadata.license` (and nothing else).
   * Idempotent: skips when what is on the order already matches. Must run
   * inside the mutation queue (or from within a queued task).
   */
  const writeLicenseNow = useCallback(async (): Promise<void> => {
    const s = stateRef.current
    const cl = config != null ? getCommerceLayer(config) : undefined
    const order = s.order
    if (!cl || !order?.id) return

    const license = licenseMetadataOf(s)
    const hash = serializeLicense(license)
    if (hash === lastLicenseHashRef.current) return

    const updated = await cl.orders.update({
      id: order.id,
      metadata: {
        ...order.metadata,
        license: { ...(order.metadata?.license || {}), ...license },
      },
    })
    lastLicenseHashRef.current = hash

    // `orders.update` returns no line items, so merge only the metadata into
    // the order we hold (replacing it wholesale would empty the cart).
    const latest = stateRef.current.order
    if (latest) {
      dispatch({
        type: ActionType.UPDATE_ORDER,
        payload: { order: { ...latest, metadata: updated.metadata } },
      })
    }
  }, [config, dispatch])

  // Debounced background write once an order exists and the license changed
  useEffect(() => {
    if (!licenseInitializedRef.current || !state.order?.id) return
    const license = serializeLicense(
      licenseMetadataOf({
        licenseOwner: state.licenseOwner,
        licenseSize: state.licenseSize,
        selectedSkuOptions: state.selectedSkuOptions,
      })
    )
    if (license === lastLicenseHashRef.current) return

    const timer = setTimeout(() => {
      licenseWriteTimerRef.current = undefined
      queue.enqueueCoalesced('license', writeLicenseNow).catch((error) => {
        console.warn(
          '[OrderProvider] ⚠️ License metadata write failed:',
          error
        )
      })
    }, LICENSE_WRITE_DEBOUNCE_MS)
    licenseWriteTimerRef.current = timer

    return () => {
      clearTimeout(timer)
      if (licenseWriteTimerRef.current === timer) {
        licenseWriteTimerRef.current = undefined
      }
    }
  }, [
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    state.order?.id,
    queue,
    writeLicenseNow,
  ])

  /**
   * Resolve once the cart is settled: the debounced license write is flushed
   * and every queued cart write has finished.
   */
  const flushPendingWrites = useCallback(async (): Promise<void> => {
    if (licenseWriteTimerRef.current) {
      clearTimeout(licenseWriteTimerRef.current)
      licenseWriteTimerRef.current = undefined
    }
    if (licenseInitializedRef.current && stateRef.current.order?.id) {
      try {
        await queue.enqueueCoalesced('license', writeLicenseNow)
      } catch (error) {
        console.warn(
          '[OrderProvider] ⚠️ License metadata write failed:',
          error
        )
      }
    }
    await queue.idle()
  }, [queue, writeLicenseNow])

  // --- Concurrency helper: run promises in batches of N ---
  const runConcurrent = useCallback(
    async <T,>(
      items: (() => Promise<T>)[],
      concurrency: number
    ): Promise<PromiseSettledResult<T>[]> => {
      const results: PromiseSettledResult<T>[] = []
      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency)
        const batchResults = await Promise.allSettled(batch.map((fn) => fn()))
        results.push(...batchResults)
      }
      return results
    },
    []
  )

  const LINE_ITEM_CONCURRENCY = 5

  /**
   * Ensure a CL order exists, creating one if needed.
   * Returns { cl, orderId, order } or throws.
   */
  const ensureOrder = useCallback(
    async (licenseTypes?: string[]) => {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) throw new Error('Commerce Layer client not initialized')

      const s = stateRef.current
      let commitOrder = s.order
      let commitOrderId = s.orderId
      if (!commitOrderId || !commitOrder?.id) {
        const types = licenseTypes ?? skuOptionRefs(s.selectedSkuOptions)
        const created = await createOrder({
          customMetadata: {
            license: {
              owner: s.licenseOwner,
              size: s.licenseSize,
              types,
            },
          },
        })
        if (!created.success || !created.orderId) {
          throw new Error('Failed to create order before committing')
        }
        // The new order already carries the license buffer
        lastLicenseHashRef.current = serializeLicense({
          ...(s.licenseOwner ? { owner: s.licenseOwner } : {}),
          ...(s.licenseSize ? { size: s.licenseSize } : {}),
          types,
        })
        const refetched = await fetchOrder({
          orderId: created.orderId,
        })
        commitOrder = refetched.order ?? created.order
        commitOrderId = created.orderId
      }
      if (!commitOrderId || !commitOrder?.id) {
        throw new Error('Order must exist before committing')
      }
      return {
        cl,
        orderId: commitOrderId,
        order: commitOrder,
      }
    },
    [config, createOrder, fetchOrder]
  )

  /** Best-effort recovery after a failed write: re-enable autorefresh and
   * refetch so the derived cart reflects whatever really is on the order. */
  const recoverAfterFailedWrite = useCallback(async () => {
    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      const orderId = stateRef.current.order?.id
      if (cl && orderId) {
        await cl.orders.update({ id: orderId, autorefresh: true })
      }
    } catch {
      /* silent */
    }
    try {
      await fetchOrder()
    } catch {
      /* silent */
    }
  }, [config, fetchOrder])

  /**
   * Commit a single parentUid group to CL line items (runs inside the mutation
   * queue; see `commitGroup` for the public, queued entry point).
   *
   * Deletes the font's existing line items, creates new ones with retryCall,
   * then refetches the order. The refetched order drives `selections` /
   * `committedGroups` (they are derived), and `options.licenseTypes` (if
   * provided) is promoted to the order-wide default.
   */
  const commitGroupNow = useCallback(
    async (
      parentUid: string,
      group: StyleGroup,
      options?: { licenseTypes?: string[] }
    ): Promise<CartWriteResult> => {
      if (Object.keys(group).length === 0) {
        return {
          success: false,
          error: { message: `No selections for group ${parentUid}` },
        }
      }

      dispatch({ type: ActionType.START_LOADING })

      try {
        const s = stateRef.current

        // Types being committed: the draft's when provided, otherwise the
        // current order-wide default. Canonical (skuOptions) order.
        const commitSkuOptions = options?.licenseTypes
          ? pickSkuOptions(s.skuOptions, options.licenseTypes)
          : s.selectedSkuOptions
        const commitTypeRefs = skuOptionRefs(commitSkuOptions)

        const {
          cl,
          orderId,
          order: ensuredOrder,
        } = await ensureOrder(commitTypeRefs)
        const commitOrder = ensuredOrder
        const commitLicenseSize = s.licenseSize
        const groupStyles = group

        const groupSize = Object.keys(groupStyles).length

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OrderProvider] commitGroup: ${parentUid}`, {
            styleCount: groupSize,
            orderId,
          })
        }

        // 1. Disable autorefresh
        await cl.orders.update({
          id: commitOrder.id,
          autorefresh: false,
        })

        // 2. Delete existing line items for this group (found on the order
        // itself: it is the source of truth for what was committed)
        const existingIds = lineItemIdsForFont(commitOrder, parentUid)
        if (existingIds.length) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitGroup: Deleting ${existingIds.length} old items for ${parentUid}`
            )
          }
          await runConcurrent(
            existingIds.map((id) => async () => {
              const result = await retryCall(() => cl.line_items.delete(id))
              if (!result?.success) {
                console.warn(`[commitGroup] Failed to delete line item ${id}`)
              }
            }),
            LINE_ITEM_CONCURRENCY
          )
        }

        // 3. Compile projections: decompose into group SKUs + leftover styles
        const orderRel = cl.orders.relationship(orderId)
        const createdLineItems: {
          id: string
          skuCode: string
        }[] = []
        const selectedSkuCodes = new Set(Object.keys(groupStyles))
        const resolvedGroups = effectiveGroupResolutions(s)[parentUid] || []

        // Find every resolved group whose styles are ALL selected
        const matchedGroups = resolvedGroups.filter((g) =>
          g.includedSkuCodes.every((code) => selectedSkuCodes.has(code))
        )
        const coveredCodes = new Set(
          matchedGroups.flatMap((g) => g.includedSkuCodes)
        )
        // Styles not covered by any matched group → individual style projection,
        // sorted into canonical display order so CL stores them in Sanity order
        const allOrderedGroupCodes = resolvedGroups.flatMap(
          (g) => g.includedSkuCodes
        )
        const styleCodeOrderMap = new Map(
          allOrderedGroupCodes.map((id, i) => [id, i])
        )
        const styleProjectionCodes = Object.keys(groupStyles)
          .filter((code) => !coveredCodes.has(code))
          .sort(
            (a, b) =>
              (styleCodeOrderMap.get(a) ?? Infinity) -
              (styleCodeOrderMap.get(b) ?? Infinity)
          )

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[OrderProvider] commitGroup: Projection plan for ${parentUid}`,
            {
              totalStyles: groupSize,
              groupProjections: matchedGroups.map((g) => g.groupName),
              styleProjections: styleProjectionCodes.length,
            }
          )
        }

        const firstEntry = Object.values(groupStyles)[0]

        // Build a reference → display name lookup from skuOptions
        const licenseTypeLabels: Record<string, string> = {}
        for (const opt of s.skuOptions) {
          if (opt.reference) {
            licenseTypeLabels[opt.reference] = opt.name ?? opt.reference
          }
        }

        // ── GROUP PROJECTIONS ────────────────────────────────────────────
        for (const matched of matchedGroups) {
          const perStyleTypes: Record<string, string[]> = {}
          const perStylePriceCents: Record<string, number> = {}
          const perStyleFullPriceCents: Record<string, number> = {}
          for (const code of matched.includedSkuCodes) {
            const types = groupStyles[code]?.licenseTypes ?? []
            perStyleTypes[code] = types
            const styleSkuOpts = s.skuOptions.filter((o) =>
              types.includes(o.reference)
            )
            perStylePriceCents[code] = calculateLineItemPrice({
              skuOptions: styleSkuOpts,
              sizeModifier: commitLicenseSize?.modifier ?? 1,
              count: groupSize,
            })
            perStyleFullPriceCents[code] = calculateLineItemPrice({
              skuOptions: styleSkuOpts,
              sizeModifier: commitLicenseSize?.modifier ?? 1,
              count: 1,
            })
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitGroup: GROUP projection → ${matched.groupName}`,
              {
                groupSkuCode: matched.groupSkuCode,
                styleCount: matched.includedSkuCodes.length,
              }
            )
          }

          const result = await retryCall(() =>
            cl.line_items.create({
              order: orderRel,
              sku_code: matched.groupSkuCode,
              reference_origin: parentUid,
              quantity: 1,
              _external_price: true,
              metadata: {
                projectionType: 'group',
                parentUid,
                parentName: firstEntry?.parentName,
                defaultVariantId: firstEntry?.defaultVariantId,
                groupName: matched.groupName,
                groupSlug: matched.groupSlug,
                includedSkuCodes: matched.includedSkuCodes,
                includedStyleNames: matched.includedSkuCodes.map(
                  (code) => groupStyles[code]?.name || code
                ),
                batchSize: groupSize,
                licenseTypeLabels,
                perStylePriceCents,
                perStyleFullPriceCents,
                license: {
                  size: commitLicenseSize,
                  defaultTypes: firstEntry?.licenseTypes,
                  perStyleTypes,
                },
              },
            })
          )

          if (result?.success && result.object) {
            createdLineItems.push({
              id: result.object.id,
              skuCode: matched.groupSkuCode,
            })
          } else {
            throw new Error(
              `Failed to create group line item for ${matched.groupSkuCode}`
            )
          }
        }

        // ── STYLE PROJECTIONS (leftover) ─────────────────────────────────
        // Metadata-only: no line_item_options created. License detail
        // lives entirely in metadata.license.types + licenseTypeLabels.
        if (styleProjectionCodes.length > 0) {
          const styleLineItemCreators = styleProjectionCodes.map(
            (skuCode) => async () => {
              const styleEntry = groupStyles[skuCode]
              const types = styleEntry?.licenseTypes ?? []
              // Compute this style's unit price for order summary display
              const styleSkuOpts = s.skuOptions.filter((o) =>
                types.includes(o.reference)
              )
              const priceCents = calculateLineItemPrice({
                skuOptions: styleSkuOpts,
                sizeModifier: commitLicenseSize?.modifier ?? 1,
                count: groupSize,
              })
              const fullPriceCents = calculateLineItemPrice({
                skuOptions: styleSkuOpts,
                sizeModifier: commitLicenseSize?.modifier ?? 1,
                count: 1,
              })

              const result = await retryCall(() =>
                cl.line_items.create({
                  order: orderRel,
                  sku_code: skuCode,
                  reference_origin: parentUid,
                  quantity: 1,
                  _external_price: true,
                  metadata: {
                    projectionType: 'style',
                    parentUid,
                    parentName: styleEntry?.parentName,
                    // Lets the cart rebuild the style's display name from the order
                    styleName: styleEntry?.name,
                    defaultVariantId: styleEntry?.defaultVariantId,
                    batchSize: groupSize,
                    priceCents,
                    fullPriceCents,
                    licenseTypeLabels,
                    license: {
                      size: commitLicenseSize,
                      types,
                    },
                  },
                })
              )
              if (result?.success && result.object) {
                createdLineItems.push({
                  id: result.object.id,
                  skuCode,
                })
              } else {
                throw new Error(`Failed to create line item for ${skuCode}`)
              }
            }
          )

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitGroup: STYLE projections for ${parentUid}`,
              {
                count: styleLineItemCreators.length,
              }
            )
          }

          const lineItemResults = await runConcurrent(
            styleLineItemCreators,
            LINE_ITEM_CONCURRENCY
          )
          const failedItems = lineItemResults.filter(
            (r) => r.status === 'rejected'
          )
          if (failedItems.length > 0) {
            console.error(
              `[commitGroup] ${failedItems.length}/${styleLineItemCreators.length} style line items failed`
            )
            // The order is the source of truth for the cart: a partial write
            // would silently drop styles, so fail the commit instead.
            throw new Error(
              `Could not add ${failedItems.length} of ${styleLineItemCreators.length} styles to your cart`
            )
          }
        }

        // 5. Re-enable autorefresh
        await forceOrderAutorefresh({
          client: cl,
          order: { ...commitOrder, autorefresh: false },
        })

        // 6. Fetch the refreshed order. It now holds the new line items, which
        // is what `selections` / `committedGroups` are derived from.
        const { order: refreshedOrder } = await fetchOrder()
        if (!refreshedOrder) {
          throw new Error(
            'Could not refresh the order after updating the cart'
          )
        }

        // Promote the saved license types to the order-wide default so the next
        // font inherits them, then persist the license buffer.
        if (options?.licenseTypes) {
          dispatch({
            type: ActionType.SET_LICENSE_TYPES,
            payload: {
              others: {
                selectedSkuOptions: commitSkuOptions,
                hasValidLicenseType: commitSkuOptions.length > 0,
              },
            },
          })
        }
        await writeLicenseNow()

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OrderProvider] commitGroup: Done for ${parentUid}`, {
            lineItems: lineItemIdsForFont(refreshedOrder, parentUid).length,
          })
        }

        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `[OrderProvider] commitGroup error (${parentUid}):`,
            error
          )
        }
        await recoverAfterFailedWrite()
        return {
          success: false,
          error: toWriteError(error, 'Failed to commit group'),
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      dispatch,
      ensureOrder,
      fetchOrder,
      runConcurrent,
      writeLicenseNow,
      recoverAfterFailedWrite,
    ]
  )

  /**
   * Remove a font from the cart: deletes its line items from the order (runs
   * inside the mutation queue; see `removeGroup`).
   */
  const removeGroupNow = useCallback(
    async (parentUid: string): Promise<CartWriteResult> => {
      const order = stateRef.current.order
      const lineItemIds = lineItemIdsForFont(order, parentUid)

      // Nothing on the order for this font: nothing to remove
      if (lineItemIds.length === 0) return { success: true }

      dispatch({ type: ActionType.START_LOADING })

      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (!cl) throw new Error('Commerce Layer client not initialized')
        if (!order?.id) throw new Error('No order to remove items from')

        await cl.orders.update({ id: order.id, autorefresh: false })

        await runConcurrent(
          lineItemIds.map((id) => async () => {
            const result = await retryCall(() => cl.line_items.delete(id))
            if (!result?.success) {
              console.warn(`[removeGroup] Failed to delete line item ${id}`)
            }
          }),
          LINE_ITEM_CONCURRENCY
        )

        await forceOrderAutorefresh({
          client: cl,
          order: { ...order, autorefresh: false },
        })

        const { order: refreshedOrder } = await fetchOrder()
        if (!refreshedOrder) {
          throw new Error(
            'Could not refresh the order after updating the cart'
          )
        }

        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `[OrderProvider] removeGroup error (${parentUid}):`,
            error
          )
        }
        await recoverAfterFailedWrite()
        return {
          success: false,
          error: toWriteError(error, 'Failed to remove group'),
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [config, dispatch, fetchOrder, runConcurrent, recoverAfterFailedWrite]
  )

  /** Commit `group` for a font. Queued; a newer commit for the same font that
   * has not started yet replaces it (latest wins). */
  const commitGroup = useCallback(
    (
      parentUid: string,
      group: StyleGroup,
      options?: { licenseTypes?: string[] }
    ): Promise<CartWriteResult> =>
      queue.enqueueCoalesced(`font:${parentUid}`, () =>
        commitGroupNow(parentUid, group, options)
      ),
    [queue, commitGroupNow]
  )

  /** Remove a font from the cart. Queued like `commitGroup`. */
  const removeGroup = useCallback(
    (parentUid: string): Promise<CartWriteResult> =>
      queue.enqueueCoalesced(`font:${parentUid}`, () =>
        removeGroupNow(parentUid)
      ),
    [queue, removeGroupNow]
  )

  /**
   * Reprice every font whose line items were priced at a different license
   * size than the current one. Each stale font is recommitted from what is on
   * the order (so nothing the user has not saved is ever written).
   */
  const repriceAll = useCallback(
    (): Promise<CartWriteResult> =>
      queue.enqueueCoalesced('reprice', async () => {
        const s = stateRef.current
        // No valid size to reprice to (e.g. cleared): leave line items alone
        if (!s.order || !s.licenseSize?.value) return { success: true }

        const selections = deriveSelectionsFromOrder(s.order)
        const committed = deriveCommittedGroups(s.order, selections)
        const stale = Object.keys(committed).filter((uid) =>
          isCommittedSizeStale(committed[uid].size, s.licenseSize)
        )

        for (const uid of stale) {
          const result = await commitGroupNow(uid, selections[uid])
          if (!result.success) return result // Bail on first failure
        }
        return { success: true }
      }),
    [queue, commitGroupNow]
  )

  /** Delete every cart line item from the order (runs inside the queue) */
  const clearCommittedItemsNow =
    useCallback(async (): Promise<CartWriteResult> => {
      const order = stateRef.current.order
      const allLineItemIds = allCartLineItemIds(order)
      if (allLineItemIds.length === 0) return { success: true }

      dispatch({ type: ActionType.START_LOADING })

      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (!cl) throw new Error('Commerce Layer client not initialized')
        if (!order?.id) throw new Error('No order to clear items from')

        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] clearCommittedItems:', {
            count: allLineItemIds.length,
          })
        }

        await cl.orders.update({
          id: order.id,
          autorefresh: false,
        })

        await runConcurrent(
          allLineItemIds.map((id) => async () => {
            await retryCall(() => cl.line_items.delete(id))
          }),
          LINE_ITEM_CONCURRENCY
        )

        await forceOrderAutorefresh({
          client: cl,
          order: { ...order, autorefresh: false },
        })

        const { order: refreshedOrder } = await fetchOrder()
        if (!refreshedOrder) {
          throw new Error(
            'Could not refresh the order after clearing the cart'
          )
        }

        return { success: true }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[OrderProvider] clearCommittedItems error:', error)
        }
        await recoverAfterFailedWrite()
        return {
          success: false,
          error: toWriteError(error, 'Failed to clear committed items'),
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    }, [config, dispatch, fetchOrder, runConcurrent, recoverAfterFailedWrite])

  /** Clears every line item from the CL order (the order itself is kept). */
  const clearCommittedItems = useCallback(
    (): Promise<CartWriteResult> => queue.enqueue(clearCommittedItemsNow),
    [queue, clearCommittedItemsNow]
  )

  // --- Cart-page edits (write through to Commerce Layer) ---
  // Each edit is reflected immediately in `selections` through `overlay`, then
  // written through the queue. The overlay entry is dropped once the write
  // settles (the refetched order has taken over), or if it fails (the cart
  // reverts to what is really on the order).

  /** A font's styles as the user currently sees them (overlay, else order) */
  const currentFontGroup = useCallback((parentUid: string): StyleGroup => {
    if (parentUid in overlayRef.current) return overlayRef.current[parentUid]
    return deriveSelectionsFromOrder(stateRef.current.order)[parentUid] ?? {}
  }, [])

  const setFontStyles = useCallback(
    async (
      parentUid: string,
      group: StyleGroup
    ): Promise<CartWriteResult> => {
      const token = (intentTokenRef.current[parentUid] ?? 0) + 1
      intentTokenRef.current[parentUid] = token

      overlayRef.current = { ...overlayRef.current, [parentUid]: group }
      setOverlay(overlayRef.current)

      let result: CartWriteResult
      try {
        result = await queue.enqueueCoalesced(`font:${parentUid}`, () =>
          Object.keys(group).length === 0
            ? removeGroupNow(parentUid)
            : commitGroupNow(parentUid, group)
        )
      } catch (error) {
        result = {
          success: false,
          error: toWriteError(error, 'Failed to update your cart'),
        }
      }

      // A newer edit for this font settles the overlay (and reports) instead
      if (intentTokenRef.current[parentUid] === token) {
        const rest = { ...overlayRef.current }
        delete rest[parentUid]
        overlayRef.current = rest
        setOverlay(rest)
        if (!result.success) {
          toaster.create({
            type: 'error',
            title: 'Your cart could not be updated',
            description: result.error?.message,
          })
        }
      }
      return result
    },
    [queue, commitGroupNow, removeGroupNow]
  )

  const removeStyles = useCallback(
    (params: { parentUid: string; skuCodes: string[] }) => {
      const remove = new Set(params.skuCodes)
      const next: StyleGroup = {}
      for (const [code, entry] of Object.entries(
        currentFontGroup(params.parentUid)
      )) {
        if (!remove.has(code)) next[code] = entry
      }
      return setFontStyles(params.parentUid, next)
    },
    [currentFontGroup, setFontStyles]
  )

  const removeFont = useCallback(
    (parentUid: string) => setFontStyles(parentUid, {}),
    [setFontStyles]
  )

  const setStyleLicenseTypes = useCallback(
    async (params: {
      parentUid: string
      skuCode: string
      licenseTypes: string[]
    }): Promise<CartWriteResult> => {
      const group = currentFontGroup(params.parentUid)
      const entry = group[params.skuCode]
      if (!entry) return { success: true }

      // A style without any license type would be priced at zero
      if (params.licenseTypes.length === 0) {
        const message = 'Each style needs at least one license type'
        toaster.create({ type: 'info', title: message })
        return { success: false, error: { message } }
      }

      return setFontStyles(params.parentUid, {
        ...group,
        [params.skuCode]: { ...entry, licenseTypes: params.licenseTypes },
      })
    },
    [currentFontGroup, setFontStyles]
  )

  // --- Clone / import (replace the cart with a shared selection) ---
  const importingRef = useRef(false)

  const importSelections = useCallback(
    async (payload: ClonePayload): Promise<CartWriteResult> => {
      if (importingRef.current) {
        return {
          success: false,
          error: { message: 'A cart import is already in progress' },
        }
      }
      if (Object.keys(payload.selections).length === 0) {
        return {
          success: false,
          error: { message: 'Nothing to import' },
        }
      }

      importingRef.current = true
      try {
        // Replace: drop the existing line items first (keeps the order itself)
        const cleared = await clearCommittedItems()
        if (!cleared.success) return cleared

        // Everything below updates `stateRef` synchronously, so the queued
        // commits see the payload's resolutions / size / types / owner.
        for (const [uid, groups] of Object.entries(
          payload.groupResolutions
        )) {
          dispatch({
            type: ActionType.REGISTER_GROUP_RESOLUTIONS,
            payload: { parentUid: uid, groups },
          })
        }
        if (payload.licenseSize) {
          dispatch({
            type: ActionType.SET_LICENSE_SIZE,
            payload: { licenseSize: payload.licenseSize },
          })
        }
        if (payload.defaultLicenseTypes.length > 0) {
          const picked = pickSkuOptions(
            stateRef.current.skuOptions,
            payload.defaultLicenseTypes
          )
          dispatch({
            type: ActionType.SET_LICENSE_TYPES,
            payload: {
              others: {
                selectedSkuOptions: picked,
                hasValidLicenseType: picked.length > 0,
              },
            },
          })
        }
        // The shared license holder is never copied: default to "Yourself"
        // unless the recipient already chose one.
        if (!stateRef.current.hasLicenseOwner) {
          dispatch({
            type: ActionType.SET_LICENSE_OWNER,
            payload: { others: { licenseOwner: { is_client: false } } },
          })
        }

        return await queue.enqueue(async (): Promise<CartWriteResult> => {
          // Create the order once up front; each commit then reuses it
          await ensureOrder(
            skuOptionRefs(stateRef.current.selectedSkuOptions)
          )
          for (const uid of Object.keys(payload.selections)) {
            const result = await commitGroupNow(uid, payload.selections[uid])
            if (!result.success) return result // Bail on first failure
          }
          return { success: true }
        })
      } catch (error) {
        return {
          success: false,
          error: toWriteError(error, 'Failed to import cart'),
        }
      } finally {
        importingRef.current = false
      }
    },
    [queue, dispatch, clearCommittedItems, ensureOrder, commitGroupNow]
  )

  // Compute additional state properties
  const hasValidLicenseSize = !!(state.licenseSize && state.licenseSize.value)
  const hasValidLicenseType = !!(
    state.selectedSkuOptions && state.selectedSkuOptions.length > 0
  )
  const allLicenseInfoSet = !!(
    state.hasLicenseOwner &&
    hasValidLicenseType &&
    hasValidLicenseSize
  )

  const hasLineItems = !!(
    state.order?.line_items && state.order.line_items.length > 0
  )

  // --- The cart, derived from the order ---
  // Commerce Layer line items are the single source of truth for what is in
  // the cart. `selections` / `committedGroups` are computed from them (see
  // derive-selections.ts), with in-flight cart-page edits overlaid.
  const derivedSelections = useMemo(
    () => deriveSelectionsFromOrder(state.order),
    [state.order]
  )
  const selections = useMemo(
    () => applySelectionOverlay(derivedSelections, overlay),
    [derivedSelections, overlay]
  )
  const committedGroups = useMemo(
    () => deriveCommittedGroups(state.order, derivedSelections),
    [state.order, derivedSelections]
  )
  // Resolutions registered by the buy page, backed up by the groups already
  // present on the order (so a fresh device keeps full groups intact)
  const groupResolutions = useMemo(
    () => effectiveGroupResolutions(state),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.order, state.groupResolutions]
  )

  // Single source of truth for the header / mini-cart badge: the number of
  // styles in the cart. NOT derived from `order.line_items` because group
  // projections collapse many styles into one line item.
  const itemsCount = useMemo(() => countSelections(selections), [selections])

  // Silent, order-wide: were any committed font's line items priced at a
  // different license size than the current one? Repriced by `repriceAll`.
  const isSizeStale = useMemo(
    () =>
      Object.values(committedGroups).some((group) =>
        isCommittedSizeStale(group.size, state.licenseSize)
      ),
    [committedGroups, state.licenseSize]
  )

  const pendingFonts = useMemo(() => Object.keys(overlay), [overlay])
  const hasPendingWrites = queueSize > 0 || pendingFonts.length > 0
  const isFullyCommitted = hasLineItems && !hasPendingWrites && !isSizeStale

  // --- Group resolutions ---
  const registerGroupResolutions = useCallback(
    (parentUid: string, groups: ResolvedFontGroup[]) => {
      dispatch({
        type: ActionType.REGISTER_GROUP_RESOLUTIONS,
        payload: { parentUid, groups },
      })
    },
    [dispatch]
  )

  // Persist registered groupResolutions to localStorage (a cache of Sanity
  // data, not user state)
  const GROUP_RESOLUTIONS_STORAGE_KEY = `${persistKey}_group_resolutions`
  useEffect(() => {
    if (!licenseInitializedRef.current) return
    if (Object.keys(state.groupResolutions).length === 0) return
    try {
      localStorage.setItem(
        GROUP_RESOLUTIONS_STORAGE_KEY,
        JSON.stringify(state.groupResolutions)
      )
    } catch {
      /* localStorage unavailable */
    }
  }, [state.groupResolutions, GROUP_RESOLUTIONS_STORAGE_KEY])

  // NOTE: the CL order is created lazily by `ensureOrder`, the first time a
  // group is committed ("Add to cart"). Until then the license buffer (owner /
  // size) lives in React state + localStorage, and license *types* live in the
  // BuyProvider draft.
  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    itemsCount,
    companySizes,
    mediaTypes,
    buyLabels: labels?.buyPage,
    cartLabels: labels?.cartPage,
    hasValidLicenseSize,
    hasValidLicenseType,
    allLicenseInfoSet,
    hasLineItems,
    createOrder,
    fetchOrder,
    refetchOrder,
    updateOrder,
    setLicenseOwner,
    setLicenseSize,
    setSelectedSkuOptions,
    // The cart (derived from the order)
    selections,
    committedGroups,
    isFullyCommitted,
    hasPendingWrites,
    isSizeStale,
    pendingFonts,
    removeStyles,
    removeFont,
    setStyleLicenseTypes,
    commitGroup,
    removeGroup,
    repriceAll,
    flushPendingWrites,
    clearCommittedItems,
    importSelections,
    // Group resolutions (hybrid projection)
    groupResolutions,
    registerGroupResolutions,
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
