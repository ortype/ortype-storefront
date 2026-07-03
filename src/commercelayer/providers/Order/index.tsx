import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { CLayerClientConfig } from '@/commercelayer/providers/identity/types'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import utils, {
  calculateSettings,
  computeGroupHash,
} from '@/commercelayer/providers/Order/utils'
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
  useReducer,
  useRef,
  useState,
} from 'react'
import { OrderStorageContext } from './Storage'
import type {
  CommittedGroups,
  GroupResolutions,
  LicenseSize,
  ResolvedFontGroup,
  SelectionBuffer,
  StyleEntry,
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

export type LicenseOwnerInput = Pick<LicenseOwner, 'is_client' | 'full_name'>

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
  isCreatingOrder: boolean
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
  hasValidLicenseSize: boolean
  hasValidLicenseType: boolean
  allLicenseInfoSet: boolean
  hasLineItems: boolean
  setLicenseOwner: (params: { licenseOwner?: LicenseOwnerInput }) => void
  setLicenseSize: (params: { licenseSize?: LicenseSize }) => void
  selections: SelectionBuffer
  committedGroups: CommittedGroups
  /** True when every buffer group has a matching committed hash and no orphaned committed groups */
  isFullyCommitted: boolean
  /** Alias for isFullyCommitted (backward compat) */
  isCommitted: boolean
  /** True when at least one committed group exists but the buffer has diverged */
  isDirty: boolean
  /** Check if a specific parentUid group is committed and clean */
  isGroupCommitted: (parentUid: string) => boolean
  /** Check if a specific parentUid group was committed but has since changed */
  isGroupDirty: (parentUid: string) => boolean
  toggleStyle: (params: {
    parentUid: string
    skuCode: string
    styleMetadata: StyleEntry
  }) => void
  toggleGroup: (params: {
    parentUid: string
    styles: { skuCode: string; styleMetadata: StyleEntry }[]
  }) => void
  setStyleLicenseTypes: (params: {
    parentUid: string
    skuCode: string
    licenseTypes: string[]
  }) => void
  /** Commit a single parentUid group to CL line items */
  commitGroup: (parentUid: string) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /** Commit all dirty/new groups; skip clean groups */
  commitSelections: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  clearCommittedItems: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  /** Clear uncommitted selections for a specific font (parentUid) */
  clearFontSelections: (parentUid: string) => void
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
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  selections: SelectionBuffer
  committedGroups: CommittedGroups
  groupResolutions: GroupResolutions
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  licenseOwner: { is_client: false },
  hasLicenseOwner: true,
  isLicenseForClient: false,
  hasValidLicenseSize: false,
  hasValidLicenseType: false,
  allLicenseInfoSet: false,
  hasLineItems: false,
  licenseSize: undefined,
  selectedSkuOptions: [],
  skuOptions: [],
  itemsCount: 0,
  isLoading: true,
  isInvalid: false,
  selections: {},
  committedGroups: {},
  groupResolutions: {},
}

const OrderContext = createContext<OrderProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as OrderProviderData
)

export const useOrderContext = (): OrderProviderData => useContext(OrderContext)

type OrderProviderProps = {
  config: CLayerClientConfig
  labels?: UiLabels | null
  metrics: LicenseMetrics
  children: ((props: OrderProviderData) => ChildrenElement) | ChildrenElement
}

export function OrderProvider({
  children,
  config,
  labels,
  metrics,
  metadata,
  attributes,
}: OrderProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Seeded once from server-fetched Sanity metrics (Providers → layout)
  const [companySizes] = useState<CompanySize[]>(metrics.sizes)
  const [mediaTypes] = useState<MediaType[]>(metrics.media)
  // True while the CL order is lazily created after all license info is set
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

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
      // Early return if we already have an order ID
      if (state.orderId) {
        return {
          success: true,
          orderId: state.orderId,
          order: state.order,
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

        // Calculate the number of items in the order
        const itemsCount = (order.line_items || []).length

        // Dispatch the CREATE_ORDER action
        dispatch({
          type: ActionType.CREATE_ORDER,
          payload: {
            order,
            orderId,
            others: {
              itemsCount,
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
              error instanceof Error ? error.message : 'Failed to create order',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      metadata,
      attributes,
      persistKey,
      setLocalOrder,
      state.orderId,
      state.order,
    ]
  )

  const fetchOrder = useCallback(
    async (params?: {
      orderId: string
    }): Promise<{
      success: boolean
      order?: Order // Assuming Order is your type for order object
    }> => {
      const orderId =
        params?.orderId ?? (persistKey ? getLocalOrder(persistKey) : undefined)
      const cl = config != null ? getCommerceLayer(config) : undefined
      try {
        if (!orderId || cl == null) {
          return { success: false }
        }
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] fetchOrder: ', orderId)
        }
        const orderResponse = await getOrder({ client: cl, orderId })
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
          // Clear all cart-related localStorage keys
          try {
            localStorage.removeItem(`${persistKey}_selections`)
            localStorage.removeItem(`${persistKey}_committed_groups`)
            localStorage.removeItem(`${persistKey}_group_resolutions`)
            localStorage.removeItem(`${persistKey}_license`)
          } catch {
            /* localStorage unavailable */
          }
          // Reset provider state: order, selections, committed groups, license
          dispatch({ type: ActionType.CLEAR_SELECTIONS })
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order: undefined,
              others: {
                orderId: undefined,
                itemsCount: 0,
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
                itemsCount: (order?.line_items || []).length,
                isInvalid: !order,
                orderId,
                ...calculateSettings(order),
              },
            },
          })
        return { success: true, order }
      } catch (error) {
        return { success: false }
      }
    },
    [config, persistKey, clearWhenPlaced, getLocalOrder, deleteLocalOrder]
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
              error instanceof Error ? error.message : 'Failed to update order',
            originalError: error,
          },
        }
      }
    },
    [config, fetchOrder]
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
    [config]
  ) // Only depend on config, not on state

  // Pure state update. Persistence to Commerce Layer is handled by the
  // debounced metadata sync + lazy order-creation effects below.
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
            hasLicenseOwner:
              licenseOwner.is_client !== null &&
              licenseOwner.is_client !== undefined,
            isLicenseForClient: licenseOwner.is_client ?? false,
            licenseOwner,
          },
        },
      })
    },
    []
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
    []
  )

  // Pure state update (see setLicenseOwner note on persistence). `font` is
  // accepted for caller compatibility but no longer used here.
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

      const parentUid = params.font?.uid
      if (parentUid) {
        dispatch({
          type: ActionType.SET_GROUP_LICENSE_TYPES,
          payload: {
            parentUid,
            licenseTypes: params.selectedSkuOptions.map((o) => o.reference),
          },
        })
      }
    },
    []
  )

  const refetchOrder = useCallback(async (): Promise<{
    success: boolean
    order?: Order
  }> => {
    return await fetchOrder()
  }, [fetchOrder])

  // Declared before initializeProvider so the ref is in scope when the callback sets it
  const selectionsInitializedRef = useRef(false)
  // Guards license persistence so we never write the empty initial state
  const licenseInitializedRef = useRef(false)

  // Create a stable initialization function
  const initializeProvider = useCallback(async () => {
    if (!config.accessToken) return

    dispatch({ type: ActionType.START_LOADING })
    try {
      // Sequential initialization
      const { order, success } = await fetchOrder()

      // Always fetch SKU options, passing existing license types if order exists
      let existingTypes: string[] = []

      if (success && order) {
        // If order is found, use its license types
        existingTypes = order.metadata?.license?.types || []

        // Hydrate selections: localStorage (primary) > order.metadata (fallback)
        let hydrated = false
        try {
          const localKey = `${persistKey}_selections`
          const stored = localStorage.getItem(localKey)
          if (stored !== null) {
            // Key exists in localStorage — treat as authoritative even if
            // empty (user intentionally cleared all selections). Only fall
            // through to metadata when the key is missing (new device).
            const parsed = JSON.parse(stored) as SelectionBuffer
            if (Object.keys(parsed).length > 0) {
              dispatch({
                type: ActionType.HYDRATE_SELECTIONS,
                payload: { selections: parsed },
              })
            }
            hydrated = true
            if (process.env.NODE_ENV !== 'production') {
              console.log(
                '[OrderProvider] 🔄 initializeProvider: Hydrated selections from localStorage',
                { count: Object.keys(parsed).length }
              )
            }
          }
        } catch {
          // localStorage unavailable
        }

        if (!hydrated && order.metadata?.cart_selections) {
          try {
            const metaSelections = JSON.parse(order.metadata.cart_selections)
            dispatch({
              type: ActionType.HYDRATE_SELECTIONS,
              payload: { selections: metaSelections },
            })
            if (process.env.NODE_ENV !== 'production') {
              console.log(
                '[OrderProvider] 🔄 initializeProvider: Hydrated selections from order metadata'
              )
            }
          } catch {
            // Corrupted metadata — ignore
          }
        }

        // Hydrate committedGroups: localStorage (primary) > metadata (fallback)
        let committedHydrated = false
        try {
          const storedCommitted = localStorage.getItem(
            `${persistKey}_committed_groups`
          )
          if (storedCommitted) {
            const parsedCommitted = JSON.parse(
              storedCommitted
            ) as CommittedGroups
            if (Object.keys(parsedCommitted).length > 0) {
              // Validate lineItemIds still exist on the order
              const orderLineItemIds = new Set(
                (order.line_items ?? [])
                  .filter(
                    (li) =>
                      li.item_type === 'skus' || li.item_type === 'bundles'
                  )
                  .map((li) => li.id)
              )
              const validatedGroups: CommittedGroups = {}
              for (const [uid, group] of Object.entries(parsedCommitted)) {
                const validIds = group.lineItemIds.filter((id) =>
                  orderLineItemIds.has(id)
                )
                if (validIds.length > 0) {
                  validatedGroups[uid] = { ...group, lineItemIds: validIds }
                }
              }
              if (Object.keys(validatedGroups).length > 0) {
                dispatch({
                  type: ActionType.HYDRATE_COMMITTED_GROUPS,
                  payload: { committedGroups: validatedGroups },
                })
                committedHydrated = true
                if (process.env.NODE_ENV !== 'production') {
                  console.log(
                    '[OrderProvider] 🔄 Hydrated committedGroups from localStorage',
                    {
                      groups: Object.keys(validatedGroups).length,
                    }
                  )
                }
              }
            }
          }
        } catch {
          /* localStorage unavailable */
        }

        if (!committedHydrated && order.metadata?.cart_committed_groups) {
          try {
            const metaCommitted = JSON.parse(
              order.metadata.cart_committed_groups
            ) as CommittedGroups
            const orderLineItemIds = new Set(
              (order.line_items ?? [])
                .filter(
                  (li) => li.item_type === 'skus' || li.item_type === 'bundles'
                )
                .map((li) => li.id)
            )
            const validatedGroups: CommittedGroups = {}
            for (const [uid, group] of Object.entries(metaCommitted)) {
              const validIds = group.lineItemIds.filter((id) =>
                orderLineItemIds.has(id)
              )
              if (validIds.length > 0) {
                validatedGroups[uid] = { ...group, lineItemIds: validIds }
              }
            }
            if (Object.keys(validatedGroups).length > 0) {
              dispatch({
                type: ActionType.HYDRATE_COMMITTED_GROUPS,
                payload: { committedGroups: validatedGroups },
              })
              if (process.env.NODE_ENV !== 'production') {
                console.log(
                  '[OrderProvider] 🔄 Hydrated committedGroups from metadata'
                )
              }
            }
          } catch {
            /* corrupted metadata */
          }
        }

        // Hydrate groupResolutions from localStorage
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
              if (process.env.NODE_ENV !== 'production') {
                console.log(
                  '[OrderProvider] 🔄 Hydrated groupResolutions from localStorage',
                  { fonts: Object.keys(parsed).length }
                )
              }
            }
          }
        } catch {
          /* localStorage unavailable */
        }

        // Enable persistence now that hydration is complete.
        // Must happen before the async work below so user interactions
        // during init are persisted immediately.
        selectionsInitializedRef.current = true

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

            if (parsed.owner?.full_name) {
              dispatch({
                type: ActionType.SET_LICENSE_OWNER,
                payload: {
                  others: {
                    hasLicenseOwner:
                      parsed.owner.is_client !== null &&
                      parsed.owner.is_client !== undefined,
                    isLicenseForClient: parsed.owner.is_client ?? false,
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
            { success, hasOrder: !!order, existingTypes }
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
              { stored: storedSize, sanity: sanitySize }
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
        console.log('[OrderProvider] ✅ initializeProvider: Initialized with', {
          skuOptions: skuResult.success,
          companySizes: metrics.sizes.length,
          mediaTypes: metrics.media.length,
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error during provider initialization:', error)
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [config.accessToken, fetchOrder, fetchSkuOptions])

  // Update the useEffect to use the stable initialization function
  useEffect(() => {
    initializeProvider()
  }, [initializeProvider])

  // --- Selections persistence ---
  // Primary: localStorage (synchronous, immediate)
  // Secondary: order.metadata (debounced, cross-device)
  // Both are guarded by selectionsInitializedRef to avoid overwriting
  // saved data with the empty initial state before hydration completes.
  const SELECTIONS_STORAGE_KEY = `${persistKey}_selections`

  // Immediate localStorage write on every selections change
  useEffect(() => {
    if (!selectionsInitializedRef.current) return
    try {
      localStorage.setItem(
        SELECTIONS_STORAGE_KEY,
        JSON.stringify(state.selections)
      )
    } catch {
      /* localStorage unavailable */
    }
  }, [state.selections, SELECTIONS_STORAGE_KEY])

  // Immediate localStorage write on every committedGroups change
  const COMMITTED_GROUPS_STORAGE_KEY = `${persistKey}_committed_groups`
  useEffect(() => {
    if (!selectionsInitializedRef.current) return
    try {
      localStorage.setItem(
        COMMITTED_GROUPS_STORAGE_KEY,
        JSON.stringify(state.committedGroups)
      )
    } catch {
      /* localStorage unavailable */
    }
  }, [state.committedGroups, COMMITTED_GROUPS_STORAGE_KEY])

  // Immediate localStorage write on every license change (owner/size/types).
  // Mirrors the selections write so partial license info survives a reload
  // before the CL order is created.
  const LICENSE_STORAGE_KEY = `${persistKey}_license`
  useEffect(() => {
    if (!licenseInitializedRef.current) return
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
    LICENSE_STORAGE_KEY,
  ])

  // Debounced metadata sync (cross-device backup) for selections + license.
  // Both are written in a single update so they never clobber each other's
  // metadata. Guarded by the init refs and only runs once an order exists.
  const metadataSyncRef = useRef<ReturnType<typeof setTimeout>>()
  const lastSyncedHashRef = useRef('')
  const getOrderMetadataSyncHash = useCallback(() => {
    const licenseMetadata = {
      owner: state.licenseOwner,
      size: state.licenseSize,
      types: state.selectedSkuOptions.map((o) => o.reference),
    }

    return JSON.stringify({
      committedGroups: state.committedGroups,
      selections: state.selections,
      license: licenseMetadata,
    })
  }, [
    state.committedGroups,
    state.selections,
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
  ])

  const syncOrderMetadata = useCallback(
    async (params?: {
      order?: Order
      selections?: SelectionBuffer
      committedGroups?: CommittedGroups
    }): Promise<Order | undefined> => {
      const cl = config != null ? getCommerceLayer(config) : undefined
      const orderToSync = params?.order ?? state.order
      if (!cl || !orderToSync?.id) return orderToSync

      if (metadataSyncRef.current) {
        clearTimeout(metadataSyncRef.current)
        metadataSyncRef.current = undefined
      }

      const licenseMetadata = {
        owner: state.licenseOwner,
        size: state.licenseSize,
        types: state.selectedSkuOptions.map((o) => o.reference),
      }
      const selections = params?.selections ?? state.selections
      const committedGroups = params?.committedGroups ?? state.committedGroups

      const payload = {
        ...orderToSync.metadata,
        license: {
          ...(orderToSync.metadata?.license || {}),
          ...licenseMetadata,
        },
        cart_selections: JSON.stringify(selections),
        cart_committed_groups: JSON.stringify(committedGroups),
      }

      const updatedOrder = await cl.orders.update({
        id: orderToSync.id,
        metadata: payload,
      })

      dispatch({
        type: ActionType.UPDATE_ORDER,
        payload: { order: updatedOrder },
      })

      lastSyncedHashRef.current = JSON.stringify({
        committedGroups,
        selections,
        license: licenseMetadata,
      })

      return updatedOrder
    },
    [
      config,
      state.order,
      state.licenseOwner,
      state.licenseSize,
      state.selectedSkuOptions,
      state.selections,
      state.committedGroups,
      getOrderMetadataSyncHash,
    ]
  )

  useEffect(() => {
    if (!selectionsInitializedRef.current && !licenseInitializedRef.current)
      return
    if (!state.orderId || !state.order?.id) return
    const currentHash = getOrderMetadataSyncHash()
    if (currentHash === lastSyncedHashRef.current) return

    if (metadataSyncRef.current) {
      clearTimeout(metadataSyncRef.current)
    }

    metadataSyncRef.current = setTimeout(async () => {
      try {
        const updatedOrder = await syncOrderMetadata()
        if (!updatedOrder) return

        if (process.env.NODE_ENV !== 'production') {
          console.log(
            '[OrderProvider] ✅ Metadata sync: wrote selections + license'
          )
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[OrderProvider] ⚠️ Metadata sync failed (non-blocking):',
            error
          )
        }
      }
    }, 1500)

    return () => {
      if (metadataSyncRef.current) {
        clearTimeout(metadataSyncRef.current)
      }
    }
  }, [
    state.selections,
    state.committedGroups,
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    state.orderId,
    state.order?.id,
    getOrderMetadataSyncHash,
    syncOrderMetadata,
  ])

  // --- Selection buffer methods (pure state updates, no API calls) ---

  const toggleStyle = useCallback(
    (params: {
      parentUid: string
      skuCode: string
      styleMetadata: StyleEntry
    }) => {
      dispatch({
        type: ActionType.TOGGLE_STYLE,
        payload: params,
      })
    },
    []
  )

  const toggleGroup = useCallback(
    (params: {
      parentUid: string
      styles: { skuCode: string; styleMetadata: StyleEntry }[]
    }) => {
      dispatch({
        type: ActionType.TOGGLE_GROUP,
        payload: params,
      })
    },
    []
  )

  const setStyleLicenseTypes = useCallback(
    (params: {
      parentUid: string
      skuCode: string
      licenseTypes: string[]
    }) => {
      dispatch({
        type: ActionType.SET_STYLE_LICENSE_TYPES,
        payload: params,
      })
    },
    []
  )

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
  const ensureOrder = useCallback(async () => {
    const cl = config != null ? getCommerceLayer(config) : undefined
    if (!cl) throw new Error('Commerce Layer client not initialized')

    let commitOrder = state.order
    let commitOrderId = state.orderId
    if (!commitOrderId || !commitOrder?.id) {
      const created = await createOrder({
        customMetadata: {
          license: {
            owner: state.licenseOwner,
            size: state.licenseSize,
            types: state.selectedSkuOptions.map((o) => o.reference),
          },
        },
      })
      if (!created.success || !created.orderId) {
        throw new Error('Failed to create order before committing')
      }
      const refetched = await fetchOrder({ orderId: created.orderId })
      commitOrder = refetched.order ?? created.order
      commitOrderId = created.orderId
    }
    if (!commitOrderId || !commitOrder?.id) {
      throw new Error('Order must exist before committing')
    }
    return { cl, orderId: commitOrderId, order: commitOrder }
  }, [
    config,
    state.order,
    state.orderId,
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    createOrder,
    fetchOrder,
  ])

  /**
   * Commit a single parentUid group to CL line items.
   * Deletes any previously committed line items for this group,
   * creates new ones with retryCall, and tracks the result.
   */
  const commitGroup = useCallback(
    async (
      parentUid: string
    ): Promise<{ success: boolean; error?: AddToCartError }> => {
      dispatch({ type: ActionType.START_LOADING })

      try {
        const { cl, orderId, order: ensuredOrder } = await ensureOrder()
        await syncOrderMetadata({ order: ensuredOrder })
        const commitOrder = ensuredOrder
        const commitLicenseSize = state.licenseSize
        const groupStyles = state.selections[parentUid]
        if (!groupStyles || Object.keys(groupStyles).length === 0) {
          throw new Error(`No selections for group ${parentUid}`)
        }

        const groupSize = Object.keys(groupStyles).length

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OrderProvider] commitGroup: ${parentUid}`, {
            styleCount: groupSize,
            orderId,
          })
        }

        // 1. Disable autorefresh
        await cl.orders.update({ id: commitOrder.id, autorefresh: false })

        // 2. Delete existing line items for this group
        const committed = state.committedGroups[parentUid]
        if (committed?.lineItemIds.length) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitGroup: Deleting ${committed.lineItemIds.length} old items for ${parentUid}`
            )
          }
          await runConcurrent(
            committed.lineItemIds.map((id) => async () => {
              const result = await retryCall(() => cl.line_items.delete(id))
              if (!result?.success) {
                console.warn(`[commitGroup] Failed to delete line item ${id}`)
              }
            }),
            LINE_ITEM_CONCURRENCY
          )
        } else {
          // Fallback: delete by reference_origin in case committedGroups was lost
          const existing = commitOrder.line_items?.filter(
            (li) =>
              li.reference_origin === parentUid &&
              (li.item_type === 'skus' || li.item_type === 'bundles')
          )
          if (existing?.length) {
            await runConcurrent(
              existing.map((li) => async () => {
                const result = await retryCall(() =>
                  cl.line_items.delete(li.id)
                )
                if (!result?.success) {
                  console.warn(
                    `[commitGroup] Failed to delete line item ${li.id}`
                  )
                }
              }),
              LINE_ITEM_CONCURRENCY
            )
          }
        }

        // 3. Compile projections: decompose into group SKUs + leftover styles
        const orderRel = cl.orders.relationship(orderId)
        const createdLineItems: { id: string; skuCode: string }[] = []
        const selectedSkuCodes = new Set(Object.keys(groupStyles))
        const resolvedGroups = state.groupResolutions[parentUid] || []

        // Find every resolved group whose styles are ALL selected
        const matchedGroups = resolvedGroups.filter((g) =>
          g.includedSkuCodes.every((code) => selectedSkuCodes.has(code))
        )
        const coveredCodes = new Set(
          matchedGroups.flatMap((g) => g.includedSkuCodes)
        )
        // Styles not covered by any matched group → individual style projection
        const styleProjectionCodes = Object.keys(groupStyles).filter(
          (code) => !coveredCodes.has(code)
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
        for (const opt of state.skuOptions) {
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
            const styleSkuOpts = state.skuOptions.filter((o) =>
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
              const styleSkuOpts = state.skuOptions.filter((o) =>
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
                createdLineItems.push({ id: result.object.id, skuCode })
              } else {
                throw new Error(`Failed to create line item for ${skuCode}`)
              }
            }
          )

          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitGroup: STYLE projections for ${parentUid}`,
              { count: styleLineItemCreators.length }
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
          }
        }

        // 5. Re-enable autorefresh
        await forceOrderAutorefresh({
          client: cl,
          order: { ...commitOrder, autorefresh: false },
        })

        // 6. Fetch refreshed order
        const { order: refreshedOrder } = await fetchOrder()

        // 7. Track committed group
        const hash = computeGroupHash(groupStyles, commitLicenseSize)
        const nextCommittedGroups: CommittedGroups = {
          ...state.committedGroups,
          [parentUid]: {
            hash,
            lineItemIds: createdLineItems.map((li) => li.id),
          },
        }
        dispatch({
          type: ActionType.SET_COMMITTED_GROUP,
          payload: {
            parentUid,
            hash,
            lineItemIds: createdLineItems.map((li) => li.id),
          },
        })
        await syncOrderMetadata({
          order: refreshedOrder ?? commitOrder,
          committedGroups: nextCommittedGroups,
        })

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[OrderProvider] commitGroup: Done for ${parentUid}`, {
            itemCount: createdLineItems.length,
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

        // Best-effort autorefresh recovery
        try {
          const cl = config != null ? getCommerceLayer(config) : undefined
          if (cl && state.order?.id) {
            await cl.orders.update({ id: state.order.id, autorefresh: true })
          }
        } catch {
          /* silent */
        }

        return {
          success: false,
          error: {
            message:
              error instanceof Error ? error.message : 'Failed to commit group',
            originalError: error,
          },
        }
      } finally {
        dispatch({ type: ActionType.STOP_LOADING })
      }
    },
    [
      config,
      state.order,
      state.orderId,
      state.selections,
      state.committedGroups,
      state.licenseSize,
      state.skuOptions,
      state.groupResolutions,
      ensureOrder,
      syncOrderMetadata,
      fetchOrder,
      runConcurrent,
    ]
  )

  /**
   * Commit all dirty/new groups; skip clean groups.
   * Used by the checkout button.
   */
  const commitSelections = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    const selections = state.selections
    const committed = state.committedGroups

    if (Object.keys(selections).length === 0) {
      return { success: false, error: { message: 'No selections to commit' } }
    }

    // Classify groups
    const dirtyOrNew: string[] = []
    const removed: string[] = []

    for (const parentUid of Object.keys(selections)) {
      const group = selections[parentUid]
      const existing = committed[parentUid]
      if (
        !existing ||
        existing.hash !== computeGroupHash(group, state.licenseSize)
      ) {
        dirtyOrNew.push(parentUid)
      }
    }
    for (const parentUid of Object.keys(committed)) {
      if (!selections[parentUid]) {
        removed.push(parentUid)
      }
    }

    // Fast path: everything is clean
    if (dirtyOrNew.length === 0 && removed.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] commitSelections: All groups clean, skipping'
        )
      }
      return { success: true }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[OrderProvider] commitSelections:', {
        dirtyOrNew,
        removed,
        clean: Object.keys(selections).filter(
          (uid) => !dirtyOrNew.includes(uid)
        ),
      })
    }

    // Handle removed groups
    if (removed.length > 0) {
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (cl) {
          for (const parentUid of removed) {
            const group = committed[parentUid]
            if (group?.lineItemIds.length) {
              await runConcurrent(
                group.lineItemIds.map((id) => async () => {
                  await retryCall(() => cl.line_items.delete(id))
                }),
                LINE_ITEM_CONCURRENCY
              )
            }
            dispatch({
              type: ActionType.REMOVE_COMMITTED_GROUP,
              payload: { parentUid },
            })
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            '[OrderProvider] commitSelections: Error removing groups:',
            error
          )
        }
      }
    }

    // Commit dirty/new groups sequentially
    for (const parentUid of dirtyOrNew) {
      const result = await commitGroup(parentUid)
      if (!result.success) {
        return result // Bail on first failure
      }
    }

    return { success: true }
  }, [
    config,
    state.selections,
    state.committedGroups,
    state.licenseSize,
    commitGroup,
    runConcurrent,
  ])

  /**
   * Clears all committed line items from the CL order.
   * The selection buffer is preserved so the user can edit and return.
   */
  const clearCommittedItems = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    const committed = state.committedGroups
    if (Object.keys(committed).length === 0) {
      return { success: true }
    }

    dispatch({ type: ActionType.START_LOADING })

    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) throw new Error('Commerce Layer client not initialized')
      if (!state.order?.id) throw new Error('No order to clear items from')

      // Collect all committed line item IDs
      const allLineItemIds = Object.values(committed).flatMap(
        (g) => g.lineItemIds
      )

      if (allLineItemIds.length > 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrderProvider] clearCommittedItems:', {
            count: allLineItemIds.length,
          })
        }

        await cl.orders.update({ id: state.order.id, autorefresh: false })

        await runConcurrent(
          allLineItemIds.map((id) => async () => {
            await retryCall(() => cl.line_items.delete(id))
          }),
          LINE_ITEM_CONCURRENCY
        )

        await forceOrderAutorefresh({
          client: cl,
          order: { ...state.order, autorefresh: false },
        })

        await fetchOrder()
      }

      dispatch({ type: ActionType.CLEAR_ALL_COMMITTED })

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] clearCommittedItems: Done, buffer preserved'
        )
      }

      return { success: true }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[OrderProvider] clearCommittedItems error:', error)
      }

      // Best-effort autorefresh recovery
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (cl && state.order?.id) {
          await cl.orders.update({ id: state.order.id, autorefresh: true })
        }
      } catch {
        /* silent */
      }

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to clear committed items',
          originalError: error,
        },
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [config, state.committedGroups, state.order, fetchOrder, runConcurrent])

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

  // --- Derived commit state ---
  const isGroupCommitted = useCallback(
    (parentUid: string): boolean => {
      const group = state.selections[parentUid]
      const committed = state.committedGroups[parentUid]
      if (!group || !committed) return false
      return committed.hash === computeGroupHash(group, state.licenseSize)
    },
    [state.selections, state.committedGroups, state.licenseSize]
  )

  const isGroupDirty = useCallback(
    (parentUid: string): boolean => {
      const committed = state.committedGroups[parentUid]
      if (!committed) return false // never committed = not dirty
      const group = state.selections[parentUid]
      if (!group) return true // committed but removed from buffer
      return committed.hash !== computeGroupHash(group, state.licenseSize)
    },
    [state.selections, state.committedGroups, state.licenseSize]
  )

  const bufferUids = Object.keys(state.selections)
  const committedUids = Object.keys(state.committedGroups)

  const isFullyCommitted =
    bufferUids.length > 0 &&
    bufferUids.every((uid) => {
      const committed = state.committedGroups[uid]
      return (
        committed &&
        committed.hash ===
          computeGroupHash(state.selections[uid], state.licenseSize)
      )
    }) &&
    committedUids.every((uid) => uid in state.selections)

  const isDirty = committedUids.length > 0 && !isFullyCommitted

  // --- Per-font selection management ---
  // Uses SELECTIONS_STORAGE_KEY declared at the persistence section above.
  const clearFontSelections = useCallback(
    (parentUid: string) => {
      dispatch({
        type: ActionType.CLEAR_FONT_SELECTIONS,
        payload: { parentUid },
      })
      // Write directly to localStorage so the clear survives navigation
      // even if the persistence effect doesn't re-run before the page
      // transition completes (production-only timing issue).
      try {
        const stored = localStorage.getItem(SELECTIONS_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          delete parsed[parentUid]
          localStorage.setItem(SELECTIONS_STORAGE_KEY, JSON.stringify(parsed))
        }
      } catch {
        /* localStorage unavailable */
      }
    },
    [SELECTIONS_STORAGE_KEY]
  )

  // --- Group resolutions ---
  const registerGroupResolutions = useCallback(
    (parentUid: string, groups: ResolvedFontGroup[]) => {
      dispatch({
        type: ActionType.REGISTER_GROUP_RESOLUTIONS,
        payload: { parentUid, groups },
      })
    },
    []
  )

  // Persist groupResolutions to localStorage
  const GROUP_RESOLUTIONS_STORAGE_KEY = `${persistKey}_group_resolutions`
  useEffect(() => {
    if (!selectionsInitializedRef.current) return
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

  // Lazily create the CL order once all license info is set. Until then the
  // license buffer lives purely in React state + localStorage. Guarded by a ref
  // so we attempt creation at most once per mount; the commitSelections safety
  // net covers the rare case where this has not finished before checkout.
  const orderCreationAttemptedRef = useRef(false)
  useEffect(() => {
    if (!licenseInitializedRef.current) return
    if (!allLicenseInfoSet) return
    if (state.orderId || state.order?.id) return
    if (orderCreationAttemptedRef.current) return

    orderCreationAttemptedRef.current = true
    let cancelled = false
    setIsCreatingOrder(true)
    ;(async () => {
      try {
        await createOrder({
          customMetadata: {
            license: {
              owner: state.licenseOwner,
              size: state.licenseSize,
              types: state.selectedSkuOptions.map((o) => o.reference),
            },
          },
        })
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[OrderProvider] Lazy order creation failed:', error)
        }
      } finally {
        if (!cancelled) setIsCreatingOrder(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    allLicenseInfoSet,
    state.orderId,
    state.order?.id,
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    createOrder,
  ])

  const value = {
    ...state,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    isCreatingOrder,
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
    // Selection buffer
    selections: state.selections,
    committedGroups: state.committedGroups,
    isFullyCommitted,
    isCommitted: isFullyCommitted,
    isDirty,
    isGroupCommitted,
    isGroupDirty,
    toggleStyle,
    toggleGroup,
    setStyleLicenseTypes,
    commitGroup,
    commitSelections,
    clearCommittedItems,
    clearFontSelections,
    // Group resolutions (hybrid projection)
    groupResolutions: state.groupResolutions,
    registerGroupResolutions,
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
