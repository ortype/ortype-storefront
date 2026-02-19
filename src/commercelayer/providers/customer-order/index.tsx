import CommerceLayer, { Order } from '@commercelayer/sdk'
import { createContext, useEffect, useState } from 'react'

import { getInfoFromJwt } from '@/utils/getInfoFromJwt'
// import { getOrder } from '@/utils/getOrder'
import { getOrder } from '@/commercelayer/providers/Order/utils/getOrder'

type CustomerOrderProviderData = {
  order?: Order
  isLoading: boolean
  isInvalid: boolean
}

type OrderStateData = {
  order?: Order
  isLoading: boolean
  isInvalid: boolean
}

const initialState: OrderStateData = {
  order: undefined,
  isLoading: true,
  isInvalid: false,
}

export const CustomerOrderContext =
  createContext<CustomerOrderProviderData | null>(null)

type CustomerOrderProviderProps = {
  orderId: string
  accessToken: string
  domain: string
  children:
    | ((props: CustomerOrderProviderData) => React.ReactNode)
    | React.ReactNode
}

export function CustomerOrderProvider({
  children,
  orderId,
  slug,
  accessToken,
  domain,
}: CustomerOrderProviderProps): JSX.Element {
  const [state, setState] = useState(initialState)

  const fetchInitialOrder = async (orderId?: string, accessToken?: string) => {
    if (!orderId || !accessToken) {
      return
    }

    // const cl = config != null ? getCommerceLayer(config) : undefined

    const { slug } = getInfoFromJwt(accessToken)
    if (!slug) {
      return
    }

    const cl = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    const orderResponse = await getOrder({ client: cl, orderId })
    const order = orderResponse?.object

    setState({
      ...state,
      order,
      isLoading: false,
      isInvalid: !order,
    })
  }

  useEffect(() => {
    setState({ ...state, isLoading: true })
    fetchInitialOrder(orderId, accessToken)
  }, [orderId, accessToken])

  const value = {
    ...state,
    order: state.order,
    isLoading: state.isLoading,
    isInvalid: state.isInvalid,
  }

  return (
    <CustomerOrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </CustomerOrderContext.Provider>
  )
}
