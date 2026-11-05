import CommerceLayer, { Order } from '@commercelayer/sdk'
import { createContext } from 'react'
import useSWR from 'swr'

import { getInfoFromJwt } from '@/utils/getInfoFromJwt'
import { getOrder } from '@/commercelayer/providers/order/utils/get-order'

type CustomerOrderProviderData = {
  order?: Order
  isLoading: boolean
  isInvalid: boolean
}

export const CustomerOrderContext =
  createContext<CustomerOrderProviderData | null>(null)

type CustomerOrderProviderProps = {
  orderId: string
  accessToken: string
  domain: string
  slug?: string
  children:
    ((props: CustomerOrderProviderData) => React.ReactNode) | React.ReactNode
}

export function CustomerOrderProvider({
  children,
  orderId,
  accessToken,
  domain,
}: CustomerOrderProviderProps): React.JSX.Element {
  const canFetch = Boolean(orderId && accessToken)
  const {
    data: order,
    error,
    isLoading,
  } = useSWR(
    canFetch
      ? (['customer-order', orderId, accessToken, domain] as const)
      : null,
    async ([, orderId, accessToken, domain]) => {
      const { slug } = getInfoFromJwt(accessToken)
      if (!slug) {
        throw new Error('Invalid customer order access token')
      }

      const client = CommerceLayer({
        organization: slug,
        accessToken,
        domain,
      })
      const response = await getOrder({ client, orderId })

      if (!response?.success || !response.object) {
        throw new Error('Unable to load customer order')
      }

      return response.object
    },
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // getOrder already retries; do not start another retry cycle in SWR.
      shouldRetryOnError: false,
    }
  )

  const value: CustomerOrderProviderData = {
    order,
    isLoading: !canFetch || isLoading,
    isInvalid: Boolean(error) && !order,
  }

  return (
    <CustomerOrderContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </CustomerOrderContext.Provider>
  )
}
