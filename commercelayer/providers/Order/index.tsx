import { getOrder } from '@/commercelayer/utils/getOrder'
import CommerceLayer, { type Order } from '@commercelayer/sdk'
import type { ChildrenElement } from 'CustomApp'
import { calculateSettings } from './utils'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'

export type LicenseSize = {
  label: string
  value: string
  modifier: number
}

type OrderProviderData = {
  order?: Order
  orderId?: string
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
  licenseSize: LicenseSize
  refetchOrder: () => Promise<void>
}

export type OrderStateData = {
  order?: Order
  orderId?: string
  licenseSize: LicenseSize
  itemsCount: number
  isLoading: boolean
  isInvalid: boolean
}

const initialState: OrderStateData = {
  order: undefined,
  orderId: undefined,
  licenseSize: {},
  itemsCount: 0,
  isLoading: true,
  isInvalid: false,
}

import { ActionType, reducer } from '@/commercelayer/providers/Order/reducer'

const OrderContext = createContext<OrderProviderData>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as OrderProviderData
)

export const useOrderContext = (): OrderProviderData => useContext(OrderContext)

type OrderProviderProps = {
  accessToken: string
  domain: string
  slug: string
  children: ((props: OrderProviderData) => ChildrenElement) | ChildrenElement
}

export function OrderProvider({
  children,
  accessToken,
  domain,
  slug,
}: OrderProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)
  console.log('OrderProvider: state: ', state)
  const fetchOrder = useCallback(
    async (accessToken?: string) => {
      const orderId = localStorage.getItem('order') ?? ''
      if (!orderId || !accessToken) {
        return
      }

      const cl = CommerceLayer({
        organization: slug,
        accessToken,
        domain,
      })

      const orderResponse = await getOrder({ client: cl, orderId })
      const order = orderResponse?.object

      const others = calculateSettings(order)

      console.log('others: ', order, others)

      dispatch({
        type: ActionType.SET_ORDER,
        payload: {
          order,
          others: {
            itemsCount: (order?.line_items || []).length,
            isInvalid: !order,
            orderId,
            ...others,
          },
        },
      })
      /*
      setState((prevState) => ({
        ...prevState,
        order,
        orderId,
        isLoading: false,
        isInvalid: !order,
      }))*/
    },
    [slug, domain]
  )

  useEffect(() => {
    dispatch({ type: ActionType.START_LOADING })
    // setState((prevState) => ({ ...prevState, isLoading: true }))
    fetchOrder(accessToken)
  }, [accessToken, fetchOrder])

  const value = {
    ...state,
    order: state.order,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
    refetchOrder: async () => {
      return await fetchOrder(accessToken)
    },
  }

  return (
    <OrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </OrderContext.Provider>
  )
}
