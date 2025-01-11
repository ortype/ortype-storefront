import { useOrderContainer } from '@commercelayer/react-components'
import CommerceLayer, {
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'

import { ActionType, reducer } from '@/commercelayer/providers/Buy/reducer'
import {
  addLineItemLicenseTypes,
  calculateSettings,
  createOrUpdateOrder,
} from '@/commercelayer/providers/Buy/utils'

import {
  fetchOrder,
  FetchOrderByIdResponse,
  updateLineItemLicenseTypes,
  updateLineItemsLicenseSize,
} from 'components/data/CheckoutProvider/utils'
import { SettingsContext } from 'components/data/SettingsProvider'

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

import { Font } from 'lib/sanity.queries'
import { useIdentityContext } from '@/commercelayer/providers/Identity'

export interface BuyProviderData {
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  font: Font
  order: Order
  licenseSize: LicenseSize
  itemsCount: number
  isLoading: boolean
  orderId: string
  accessToken: string
  slug: string
  domain: string
  isFirstLoading: boolean
  getOrder: (order: Order) => void
  getOrderFromRef: () => Promise<Order>
  setLicenseSize: (params: { order?: Order; licenseSize?: LicenseSize }) => void
  setSelectedSkuOptions: (params: {
    order?: Order
    selectedSkuOptions: SkuOption[]
  }) => void
  addLineItem: (params: { skuCode: string }) => void
  deleteLineItem: (params: { lineItemId: string }) => void
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[] 
  // @NOTE: state.selectedSkuOptions is reset on page reload 
  // that's good or bad? for testing its weird since I refresh a lot but probably not an issue for the end-user)

}

interface BuyProviderProps {
  font: Font
  children?: JSX.Element[] | JSX.Element | null
}

export interface AppStateData {
  order?: Order
  itemsCount: number
  licenseSize: LicenseSize
  skuOptions: SkuOption[]
  selectedSkuOptions: SkuOption[]
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  order: undefined,
  itemsCount: 0,
  isLoading: true,
  isFirstLoading: true,
  licenseSize: {},
  licenseTypes: [],
  selectedSkuOptions: [],
}

export const BuyContext = createContext<BuyProviderData | null>(null)

export const useBuy = (): BuyProviderData => {
  const ctx = useContext(BuyContext)
  // console.log('useBuy provider: ', ctx, ctx.isLoading, !!ctx.isLoading)
  return {
    ...ctx,
    isLoading: !!ctx.isLoading,
  }
}

export const BuyProvider: FC<BuyProviderProps> = ({ font, children }) => {
  const orderRef = useRef<Order>()
  const [state, dispatch] = useReducer(reducer, initialState)

  const { addToCart, createOrder, updateOrder } = useOrderContainer()

  const { settings: { accessToken }, config: { domain, slug } } = useIdentityContext()

  const orderId = localStorage.getItem('order') ?? ''

  const cl = CommerceLayer({
    organization: slug,
    accessToken,
    domain,
  })

  const getOrder = (order: Order) => {
    orderRef.current = order
  }

  const fetchInitialOrder = async (orderId?: string, accessToken?: string) => {
    if (!orderId || !accessToken) {
      return
    }
    dispatch({ type: ActionType.START_LOADING })
    const order = await getOrderFromRef()

    console.log('BUY: fetchInitialOrder settings: ', order)

    const others = calculateSettings(order, state)

    dispatch({
      type: ActionType.SET_ORDER,
      payload: {
        order,
        others: {
          itemsCount: (order.line_items || []).length,
          ...others,
        },
      },
    })
  }

  const fetchSkuOptions = async () => {
    dispatch({ type: ActionType.START_LOADING })

    const skuOptions = await cl.sku_options.list()
    console.log('fetchSkuOptions: ', skuOptions, skuOptions[0])
    // @TODO: maybe we need to select the sku_options on initial load from the line_items of this font
    // but this could get confusing if you already have items in the cart from that font
    // Dinamo presents the license size as the first step in the buy process and has no default selection

    dispatch({
      type: ActionType.SET_SKU_OPTIONS,
      payload: {
        skuOptions,
        others: {
          // initial license type setting
          selectedSkuOptions: [skuOptions[0]],
        },
      },
    })
  }

  const setLicenseSize = async (params: { licenseSize?: LicenseSize }) => {
    dispatch({ type: ActionType.START_LOADING })
    const order = await fetchOrder(cl, orderId)
    // @TODO: dispatch a notifcation to the user that "All your bag items will be adjusted"
    await createOrUpdateOrder({
      createOrder,
      updateOrder,
      order,
      licenseSize: params.licenseSize,
    })
    await updateLineItemsLicenseSize({
      cl,
      order,
      licenseSize: params.licenseSize,
    })

    dispatch({
      type: ActionType.SET_LICENSE_SIZE,
      payload: {
        licenseSize: params.licenseSize,
        order: await fetchOrder(cl, orderId),
      },
    })
  }

  const setSelectedSkuOptions = async (params: {
    selectedSkuOptions: SkuOption[]
    order?: Order
  }) => {
    dispatch({ type: ActionType.START_LOADING })
    const currentOrder = params.order ?? (await getOrderFromRef())

    console.log('params.selectedSkuOptions: ', params.selectedSkuOptions)
    if (params.selectedSkuOptions && params.selectedSkuOptions.length > 0) {
      // When you change the License Size in Dinamo buy page, a notification appears
      // stating all items will be updated and confirms that choice. When you change the global
      // license type, they show an inline notification on that SKU item.

      // @TODO: Trigger notifcation stating that all items in the Cart for this font will be updated
      // Alternatively: add a inline notification to skus that have already been added to the cart,
      // with a calculated price based on that line_items skuOptions

      if (currentOrder.line_items?.length > 0) {
        // Find line items from this font
        const lineItemsOfFont = currentOrder.line_items.filter((lineItem) =>
          font.variants.some(
            (fontVariant) => fontVariant._id === lineItem.sku_code
          )
        )
        console.log('lineItemsOfFont: ', lineItemsOfFont)
        for (const lineItem of lineItemsOfFont) {
          await updateLineItemLicenseTypes({
            cl,
            lineItem,
            order: currentOrder,
            selectedSkuOptions: params.selectedSkuOptions,
          })
        }
      }
    }

    dispatch({
      type: ActionType.SET_LICENSE_TYPES,
      payload: {
        order: await fetchOrder(cl, orderId),
        others: {
          selectedSkuOptions: params.selectedSkuOptions,
        },
      },
    })
  }

  // @TODO: addLineItem
  const addLineItem = async (params: { skuCode: string }) => {
    dispatch({ type: ActionType.START_LOADING })
    try {
      // @types
      // https://github.com/commercelayer/commercelayer-react-components/blob/main/packages/react-components/src/reducers/OrderReducer.ts#L383
      const attrs = {
        skuCode: params.skuCode,
        lineItem: {
          externalPrice: true,
          metadata: {
            license: {
              size: state.licenseSize,
              types: state.selectedSkuOptions.map((option) => option.reference),
            },
          },
        },
        orderMetadata: { license: { size: state.licenseSize } },
        quantity: 1,
      }
      console.log('addLineItem addToCart attrs: ', attrs)
      await addToCart(attrs)
      const order = await fetchOrder(cl, orderId)
      console.log('addLineItem order: ', order)

      if (order && order.line_items) {
        // use the param `skuCode` to match the right `order.lineItems`
        const lineItem = order.line_items.find(({sku_code}) => sku_code === params.skuCode)
        console.log('addLineItem lineItem: ', lineItem)
        if (lineItem) {
          const res = await addLineItemLicenseTypes({
            cl,
            lineItem,
            selectedSkuOptions: state.selectedSkuOptions,
          })
        
          dispatch({
            type: ActionType.ADD_LINE_ITEM,
            payload: { order: await fetchOrder(cl, orderId) },
            // @TODO: maybe need to update `state.itemsCount` here
          })
        }
      }

    } catch (error: any) {
      console.log('addLineItem error: ', error)
    }
  }

  const deleteLineItem = async (params: { lineItemId: string }) => {
    dispatch({ type: ActionType.START_LOADING })
    try {
      await cl.line_items.delete(params.lineItemId)
      dispatch({
        type: ActionType.DELETE_LINE_ITEM,
        payload: { order: await fetchOrder(cl, orderId) },
        // @TODO: maybe need to update `state.itemsCount` here
      })
    } catch (error: any) {
      console.log('deleteLineItem error: ', error)
    }
  }

  const getOrderFromRef = async () => {
    return orderRef.current || (await fetchOrder(cl, orderId))
  }

  useEffect(() => {
    const unsubscribe = () => {
      fetchSkuOptions()
      fetchInitialOrder(orderId, accessToken)
    }
    return unsubscribe()
  }, [orderId, accessToken])

  // @TODO: Why is isLoading false when `order` is undefined

  return (
    <BuyContext.Provider
      value={{
        ...state,
        font,
        orderId,
        accessToken,
        slug,
        domain,
        getOrderFromRef,
        getOrder,
        setLicenseSize,
        setSelectedSkuOptions,
        addLineItem,
        deleteLineItem,
      }}
    >
      {children}
    </BuyContext.Provider>
  )
}
