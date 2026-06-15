import { LicenseOwner } from '@/commercelayer/providers/checkout'
import { CLayerClientConfig } from '@/commercelayer/providers/identity/types'
import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'
import utils, {
  calculateSettings,
  computeSelectionsHash,
} from '@/commercelayer/providers/Order/utils'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { forceOrderAutorefresh } from '@/commercelayer/utils/forceOrderAutorefresh'
import { executeBatch, type Task } from '@commercelayer/sdk-utils'
import {
  type BuyLabels,
  type CartLabels,
  type CompanySize,
  type LicenseMetrics,
  type MediaType,
  type UiLabels,
} from '@/sanity/lib/queries'
import {
  LineItem,
  OrderUpdate,
  SkuOption,
  type Order,
} from '@commercelayer/sdk'
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

export type { LicenseSize, StyleEntry, SelectionBuffer } from './types'
import type { LicenseSize, StyleEntry, SelectionBuffer } from './types'

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
  isCommitted: boolean
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
  commitSelections: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
  clearCommittedItems: () => Promise<{
    success: boolean
    error?: AddToCartError
  }>
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
  isCommitted: boolean
  committedSelectionsHash: string
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  licenseOwner: undefined,
  hasLicenseOwner: false,
  isLicenseForClient: false, // Add default value
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
  isCommitted: false,
  committedSelectionsHash: '',
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
              '[OrderProvider] fetchOrder: Order has been placed, clearing local storage',
              { orderId, persistKey }
            )
          }
          deleteLocalOrder(persistKey)
          dispatch({
            type: ActionType.SET_ORDER,
            payload: {
              order: undefined,
              others: {
                orderId: undefined,
                itemsCount: 0,
                isInvalid: false,
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
        console.log('[OrderProvider] setLicenseOwner (state-only):', licenseOwner)
      }

      dispatch({
        type: ActionType.SET_LICENSE_OWNER,
        payload: {
          others: {
            hasLicenseOwner: !!licenseOwner.full_name?.trim(),
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
      if (!params.licenseSize) return

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
          if (stored) {
            const parsed = JSON.parse(stored) as SelectionBuffer
            if (Object.keys(parsed).length > 0) {
              dispatch({
                type: ActionType.HYDRATE_SELECTIONS,
                payload: { selections: parsed },
              })
              hydrated = true
              if (process.env.NODE_ENV !== 'production') {
                console.log(
                  '[OrderProvider] 🔄 initializeProvider: Hydrated selections from localStorage'
                )
              }
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
                    hasLicenseOwner: !!parsed.owner.full_name.trim(),
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
      const serialized = JSON.stringify(state.selections)
      localStorage.setItem(SELECTIONS_STORAGE_KEY, serialized)
    } catch {
      // localStorage unavailable (SSR, private browsing quota, etc.)
    }
  }, [state.selections, SELECTIONS_STORAGE_KEY])

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

  useEffect(() => {
    if (!selectionsInitializedRef.current && !licenseInitializedRef.current)
      return
    if (!state.orderId || !state.order?.id) return

    const licenseMetadata = {
      owner: state.licenseOwner,
      size: state.licenseSize,
      types: state.selectedSkuOptions.map((o) => o.reference),
    }
    const currentHash = JSON.stringify({
      selections: state.selections,
      license: licenseMetadata,
    })
    if (currentHash === lastSyncedHashRef.current) return

    if (metadataSyncRef.current) {
      clearTimeout(metadataSyncRef.current)
    }

    metadataSyncRef.current = setTimeout(async () => {
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (!cl || !state.order?.id) return

        const payload = {
          ...state.order.metadata,
          license: {
            ...(state.order.metadata?.license || {}),
            ...licenseMetadata,
          },
          cart_selections: JSON.stringify(state.selections),
        }

        await cl.orders.update({
          id: state.order.id,
          metadata: payload,
        })

        lastSyncedHashRef.current = currentHash

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
    state.licenseOwner,
    state.licenseSize,
    state.selectedSkuOptions,
    state.orderId,
    state.order?.id,
    config,
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

  const commitSelections = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    dispatch({ type: ActionType.START_LOADING })

    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      // Safety net: ensure an order exists. Normally the lazy-creation effect
      // already created it once all license info was set, but a very fast
      // checkout click could arrive first.
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
          throw new Error('Failed to create order before committing selections')
        }
        const refetched = await fetchOrder({ orderId: created.orderId })
        commitOrder = refetched.order ?? created.order
        commitOrderId = created.orderId
      }
      if (!commitOrderId || !commitOrder?.id) {
        throw new Error('Order must exist before committing selections')
      }

      const selections = state.selections
      if (Object.keys(selections).length === 0) {
        throw new Error('No selections to commit')
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] commitSelections: Starting commit', {
          orderId: state.orderId,
          groupCount: Object.keys(selections).length,
          totalStyles: Object.values(selections).reduce(
            (total, group) => total + Object.keys(group).length,
            0
          ),
        })
      }

      // 1. Disable auto-refresh to prevent N recalculations
      await cl.orders.update({ id: commitOrder.id, autorefresh: false })

      // --- Concurrency helper: run promises in batches of N ---
      const runConcurrent = async <T>(
        items: (() => Promise<T>)[],
        concurrency: number
      ): Promise<PromiseSettledResult<T>[]> => {
        const results: PromiseSettledResult<T>[] = []
        for (let i = 0; i < items.length; i += concurrency) {
          const batch = items.slice(i, i + concurrency)
          const batchResults = await Promise.allSettled(
            batch.map((fn) => fn())
          )
          results.push(...batchResults)
        }
        return results
      }

      const CONCURRENCY = 5

      // 2. Delete any existing shoppable line items (from a previous commit)
      const existingItems = commitOrder.line_items?.filter(
        (li) => li.item_type === 'skus' || li.item_type === 'bundles'
      )
      if (existingItems?.length) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[OrderProvider] commitSelections: Clearing ${existingItems.length} existing line items (concurrency: ${CONCURRENCY})`
          )
        }
        await runConcurrent(
          existingItems.map((li) => () => cl.line_items.delete(li.id)),
          CONCURRENCY
        )
      }

      // 3. Create line items in parallel batches
      const orderRel = cl.orders.relationship(commitOrderId)
      const lineItemCreators: (() => Promise<any>)[] = []

      for (const [parentUid, styles] of Object.entries(selections)) {
        const groupSize = Object.keys(styles).length

        for (const [skuCode, styleEntry] of Object.entries(styles)) {
          lineItemCreators.push(() =>
            cl.line_items.create({
              order: orderRel,
              sku_code: skuCode,
              reference_origin: parentUid,
              quantity: 1,
              _external_price: true,
              metadata: {
                parentUid,
                parentName: styleEntry.parentName,
                defaultVariantId: styleEntry.defaultVariantId,
                batchSize: groupSize,
                license: {
                  size: state.licenseSize,
                  types: styleEntry.licenseTypes,
                },
              },
            })
          )
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[OrderProvider] commitSelections: Creating ${lineItemCreators.length} line items (concurrency: ${CONCURRENCY})`
        )
      }

      const lineItemResults = await runConcurrent(lineItemCreators, CONCURRENCY)
      const failedLineItems = lineItemResults.filter(
        (r) => r.status === 'rejected'
      )
      if (failedLineItems.length > 0) {
        console.error(
          `[commitSelections] ${failedLineItems.length} line items failed to create`
        )
      }

      // 4. Create line_item_options in parallel batches
      const { order: orderWithItems } = await fetchOrder()
      if (orderWithItems?.line_items?.length) {
        const optionCreators: (() => Promise<any>)[] = []

        for (const lineItem of orderWithItems.line_items) {
          if (
            lineItem.item_type !== 'skus' &&
            lineItem.item_type !== 'bundles'
          )
            continue

          const parentUid = lineItem.metadata?.parentUid ?? ''
          const skuCode = lineItem.sku_code ?? ''
          const styleEntry = skuCode
            ? selections[parentUid]?.[skuCode]
            : undefined
          if (!styleEntry) continue

          const matchingOptions = state.skuOptions.filter((opt) =>
            styleEntry.licenseTypes.includes(opt.reference)
          )

          for (const skuOption of matchingOptions) {
            optionCreators.push(() =>
              cl.line_item_options.create({
                quantity: 1,
                options: {},
                sku_option: cl.sku_options.relationship(skuOption.id),
                line_item: cl.line_items.relationship(lineItem.id),
              })
            )
          }
        }

        if (optionCreators.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(
              `[OrderProvider] commitSelections: Creating ${optionCreators.length} line_item_options (concurrency: ${CONCURRENCY})`
            )
          }
          await runConcurrent(optionCreators, CONCURRENCY)
        }
      }

      // 5. Re-enable auto-refresh and trigger a single refresh
      await forceOrderAutorefresh({
        client: cl,
        order: { ...commitOrder, autorefresh: false },
      })

      // 6. Fetch the fully refreshed order
      const { order: refreshedOrder } = await fetchOrder()
      if (!refreshedOrder) {
        throw new Error('Failed to fetch order after commit')
      }

      // 7. Mark as committed with a hash for change detection
      const hash = computeSelectionsHash(selections)
      dispatch({
        type: ActionType.SET_COMMITTED,
        payload: { committedSelectionsHash: hash },
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrderProvider] commitSelections: Commit complete', {
          lineItemCount: refreshedOrder.line_items?.length,
        })
      }

      return { success: true }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[OrderProvider] commitSelections error:', error)
      }

      // Attempt to re-enable autorefresh on failure
      try {
        const cl = config != null ? getCommerceLayer(config) : undefined
        if (cl && state.order?.id) {
          await cl.orders.update({
            id: state.order.id,
            autorefresh: true,
          })
        }
      } catch {
        // Best-effort recovery
      }

      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to commit selections',
          originalError: error,
        },
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
    }
  }, [
    config,
    state.orderId,
    state.order,
    state.selections,
    state.licenseSize,
    state.selectedSkuOptions,
    state.licenseOwner,
    state.skuOptions,
    createOrder,
    fetchOrder,
  ])

  /**
   * Clears committed line items from the CL order when the user exits
   * checkout and has modified selections (Option A).
   * The selection buffer is preserved so the user can edit and return.
   * Only deletes if selections have actually changed since last commit.
   */
  const clearCommittedItems = useCallback(async (): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    // Nothing to clear if not committed
    if (!state.isCommitted) {
      return { success: true }
    }

    // Check if selections have changed since commit
    const currentHash = computeSelectionsHash(state.selections)
    if (currentHash === state.committedSelectionsHash) {
      // Selections unchanged — committed line items are still valid
      return { success: true }
    }

    dispatch({ type: ActionType.START_LOADING })

    try {
      const cl = config != null ? getCommerceLayer(config) : undefined
      if (!cl) {
        throw new Error('Commerce Layer client not initialized')
      }

      if (!state.order?.id) {
        throw new Error('No order to clear items from')
      }

      // Get current line items to delete
      const lineItems = state.order.line_items?.filter(
        (li) => li.item_type === 'skus' || li.item_type === 'bundles'
      )

      if (!lineItems?.length) {
        dispatch({ type: ActionType.CLEAR_COMMITTED })
        return { success: true }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] clearCommittedItems: Deleting committed line items',
          { count: lineItems.length }
        )
      }

      // Disable autorefresh during bulk delete
      await cl.orders.update({ id: state.order.id, autorefresh: false })

      // Batch-delete all committed line items
      const deleteTasks: Task[] = lineItems.map((li) => ({
        resourceType: 'line_items' as const,
        operation: 'delete' as const,
        resource: { id: li.id },
        onFailure: {
          errorHandler: (err: unknown) => {
            console.error(
              `[clearCommittedItems] Failed to delete ${li.sku_code}:`,
              err
            )
          },
        },
      }))

      await executeBatch({ tasks: deleteTasks })

      // Re-enable autorefresh
      await forceOrderAutorefresh({
        client: cl,
        order: { ...state.order, autorefresh: false },
      })

      // Fetch cleaned order
      await fetchOrder()

      // Clear committed flag — buffer is preserved for editing
      dispatch({ type: ActionType.CLEAR_COMMITTED })

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          '[OrderProvider] clearCommittedItems: Done, buffer preserved for editing'
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
          await cl.orders.update({
            id: state.order.id,
            autorefresh: true,
          })
        }
      } catch {
        // Silent recovery
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
  }, [
    config,
    state.isCommitted,
    state.committedSelectionsHash,
    state.selections,
    state.order,
    fetchOrder,
  ])

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

  console.log({allLicenseInfoSet, hasValidLicenseSize, hasValidLicenseType, hasLicenseOwner: state.hasLicenseOwner})

  const hasLineItems = !!(
    state.order?.line_items && state.order.line_items.length > 0
  )

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
    isCommitted: state.isCommitted,
    toggleStyle,
    toggleGroup,
    setStyleLicenseTypes,
    commitSelections,
    clearCommittedItems,
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
