import { useOrderContainer } from '@commercelayer/react-components'
import { createContext, FC, useContext, useReducer } from 'react'

import { ActionType, reducer } from '@/commercelayer/providers/Buy/reducer'
import { addLineItemLicenseTypes } from '@/commercelayer/providers/Buy/utils'

import { useIdentityContext } from '@/commercelayer/providers/Identity'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import { Order, SkuOption } from '@commercelayer/sdk'
import { Font } from 'lib/sanity.queries'
import { useOrderContext } from '../Order'

export interface BuyProviderData {
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  font: Font
  itemsCount: number
  isLoading: boolean
  addLineItem: (params: { skuCode: string }) => void
}

interface BuyProviderProps {
  font: Font
  children?: JSX.Element[] | JSX.Element | null
}

export interface AppStateData {
  isLoading: boolean
}

const initialState: AppStateData = {
  isLoading: true,
}

const BuyContext = createContext<BuyProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as BuyProviderData
)

export const useBuyContext = (): BuyProviderData => useContext(BuyContext)

export const BuyProvider: FC<BuyProviderProps> = ({ font, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const { addToCart } = useOrderContainer()

  const {
    settings: { accessToken },
    clientConfig: config,
  } = useIdentityContext()

  const { orderId, order, refetchOrder, selectedSkuOptions, licenseSize } =
    useOrderContext()

  const addLineItem = async (params: { skuCode: string }) => {
    dispatch({ type: ActionType.START_LOADING })
    const cl = config != null ? getCommerceLayer(config) : undefined
    try {
      if (config == null) return
      // @types
      // https://github.com/commercelayer/commercelayer-react-components/blob/main/packages/react-components/src/reducers/OrderReducer.ts#L383
      const attrs = {
        skuCode: params.skuCode,
        lineItem: {
          externalPrice: true,
          metadata: {
            license: {
              size: licenseSize,
              types: selectedSkuOptions.map((option) => option.reference),
            },
          },
        },
        orderMetadata: { license: { size: licenseSize } },
        quantity: 1,
      }
      console.log('addLineItem addToCart attrs: ', attrs)
      await addToCart(attrs)
      const { order } = await refetchOrder()
      console.log('addLineItem order: ', order)

      if (order && order.line_items && order.line_items?.length > 0) {
        // @NOTE: we have issues with fetching the order returning `metadata` on initial create
        // use the param `skuCode` to match the right `order.lineItems`
        const lineItem = order.line_items.find(
          ({ sku_code }) => sku_code === params.skuCode
        )
        console.log('addLineItem lineItem: ', lineItem)
        if (lineItem) {
          const res = await addLineItemLicenseTypes({
            cl,
            lineItem,
            selectedSkuOptions: selectedSkuOptions,
          })

          const { order } = await refetchOrder()
          order &&
            dispatch({
              type: ActionType.ADD_LINE_ITEM,
              payload: { order },
              // @TODO: maybe need to update `state.itemsCount` here
            })
        }
      }
    } catch (error: any) {
      console.log('addLineItem error: ', error)
    }
  }

  // @TODO: consider useEffect with refetchOrder() as a path for ensuring that
  // we have the current order object available (if we made changes to the order in the checkout)
  // orders will be 'drafts' until they are submitted

  return (
    <BuyContext.Provider
      value={{
        ...state,
        font,
        addLineItem,
      }}
    >
      {children}
    </BuyContext.Provider>
  )
}
