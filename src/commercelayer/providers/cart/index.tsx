import CommerceLayer, {
  type LineItem,
  type Order,
  type SkuOption,
} from '@commercelayer/sdk'
import { InvalidCartSettings } from 'CustomApp'
import { createContext, FC, useContext, useEffect, useReducer } from 'react'

import { ActionType, reducer } from './reducer'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import { useOrderContext } from '@/commercelayer/providers/Order'

export interface CartProviderData {
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  isLoading: boolean
  accessToken: string
  slug: string
  domain: string
}

interface CartProviderProps {
  children?: JSX.Element[] | JSX.Element | null
}

export interface AppStateData {
  isLoading: boolean
}

const initialState: AppStateData = {
  isLoading: true,
}

export const CartContext = createContext<CartProviderData | null>(null)

export const CartProvider: FC<CartProviderProps> = ({ children }) => {
  const {
    settings: { accessToken },
    config,
  } = useIdentityContext()
  const { orderId, order, refetchOrder } = useOrderContext()

  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <CartContext.Provider
      value={{
        ...state,
        orderId,
        accessToken,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
