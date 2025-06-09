import { createContext, FC, useContext, useReducer } from 'react'

import { ActionType, reducer } from '@/commercelayer/providers/Buy/reducer'
import { addLineItemLicenseTypes } from '@/commercelayer/providers/Buy/utils'

import { toaster } from '@/components/ui/toaster'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import type { AddToCartError } from '@/commercelayer/providers/Order'
import getCommerceLayer from '@/commercelayer/utils/getCommerceLayer'
import { Font } from '@/sanity/lib/queries'
import { useOrderContext } from '../Order'

export interface BuyProviderData {
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  font: Font
  itemsCount: number
  isLoading: boolean
  addLineItem: (params: { skuCode: string }) => Promise<{
    success: boolean
    error?: AddToCartError
  }>
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

  const { clientConfig: config } = useIdentityContext()

  const { order, addToCart, refetchOrder, selectedSkuOptions, licenseSize } =
    useOrderContext()

  /**
   * Adds a line item to the cart with proper license metadata.
   *
   * @param params - Parameters for adding the line item
   * @param params.skuCode - The SKU code of the item to add
   *
   * @returns Promise resolving to result object containing:
   * - success: boolean indicating if operation was successful
   * - error?: error information if operation failed, including:
   *   - message: human-readable error message
   *   - originalError?: the underlying error object
   */
  const addLineItem = async (params: {
    skuCode: string
    name: string
  }): Promise<{
    success: boolean
    error?: AddToCartError
  }> => {
    dispatch({ type: ActionType.START_LOADING })
    const cl = config != null ? getCommerceLayer(config) : undefined

    try {
      if (config == null) {
        throw new Error('Commerce Layer client not initialized')
      }

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

      if (process.env.NODE_ENV !== 'production') {
        console.log('addLineItem addToCart attrs: ', attrs)
      }

      const result = await addToCart(attrs)
      if (!result.success) {
        // Show error notification
        const errorMessage = result.error?.message || 'Failed to add item to cart'
        toaster.create({
          title: 'Failed to add to cart',
          description: errorMessage,
          type: 'error',
          duration: 4000,
        })
        return {
          success: false,
          error: result.error,
        }
      }

      // Format license types for display
      const licenseTypes = selectedSkuOptions
        ?.map(option => option.name)
        ?.join(', ')

      // Format license size for display
      const licenseSizeLabel = licenseSize?.label

      // Show success notification with item details
      toaster.create({
        title: 'Added to cart',
        description: `${params.name}${licenseTypes ? ` (${licenseTypes})` : ''}${licenseSizeLabel ? ` - ${licenseSizeLabel}` : ''}`,
        type: 'success',
        duration: 3000,
      })

      const { order } = await refetchOrder()
      if (!order?.line_items?.length) {
        return {
          success: false,
          error: {
            message: 'Failed to add item to cart: Order not found',
          },
        }
      }

      // Find the line item we just added
      const lineItem = order.line_items.find(
        ({ sku_code }) => sku_code === params.skuCode
      )

      if (!lineItem) {
        return {
          success: false,
          error: {
            message: 'Failed to add item to cart: Line item not found',
          },
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('addLineItem lineItem: ', lineItem)
      }

      // Update line item with license types
      await addLineItemLicenseTypes({
        cl,
        lineItem,
        selectedSkuOptions,
      })

      // Get updated order and update state
      const { order: updatedOrder } = await refetchOrder()
      if (updatedOrder) {
        dispatch({
          type: ActionType.ADD_LINE_ITEM,
          payload: { order: updatedOrder },
        })
      }

      return { success: true }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error adding line item:', error)
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart'
      // Show error notification
      toaster.create({
        title: 'Failed to add to cart',
        description: errorMessage,
        type: 'error',
        duration: 4000,
      })

      return {
        success: false,
        error: {
          message: errorMessage,
          originalError: error,
        },
      }
    } finally {
      dispatch({ type: ActionType.STOP_LOADING })
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
