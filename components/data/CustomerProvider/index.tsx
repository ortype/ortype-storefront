import CommerceLayer from '@commercelayer/sdk'
import type { Settings } from 'CustomApp'
import { getCustomerDetails } from 'utils/getCustomerDetails'
import { getInfoFromJwt } from 'utils/getInfoFromJwt'
import { createContext, useEffect, useState } from 'react'

type CustomerProviderData = Pick<
  Settings,
  'customerId' | 'accessToken' | 'endpoint'
> & {
  domain: string
  email: string
  hasPassword: boolean
  isLoading: boolean
  isFirstLoading: boolean
  refetchCustomer: () => Promise<void>
}

interface AppStateData {
  email: string
  hasPassword: boolean
  isLoading: boolean
  isFirstLoading: boolean
}

const initialState: AppStateData = {
  isLoading: true,
  isFirstLoading: true,
  email: '',
  hasPassword: false,
}

export const CustomerContext = createContext<CustomerProviderData | null>(null)

type CustomerProviderProps = Pick<
  Settings,
  'customerId' | 'accessToken' | 'endpoint'
> & {
  domain: string
  children: React.ReactNode
}

export function CustomerProvider({
  children,
  customerId,
  accessToken,
  endpoint,
  domain,
}: CustomerProviderProps): JSX.Element {
  const [state, setState] = useState(initialState)

  const fetchCustomerHandle = async (
    customerId?: string,
    accessToken?: string
  ) => {
    if (!customerId || !accessToken) {
      return
    }
    setState({ ...state, isLoading: true })

    // @TODO: we have the slug in the SettingsProvider
    const { slug } = getInfoFromJwt(accessToken)
    if (!slug) {
      return
    }

    const client = CommerceLayer({
      organization: slug,
      accessToken,
      domain,
    })

    return await getCustomerDetails({
      client,
      customerId,
    }).then((customerResponse) => {
      const customer = customerResponse?.object
      setState({
        email: customer?.email ?? '',
        hasPassword: customer?.has_password ?? false,
        isLoading: false,
        isFirstLoading: false,
      })
    })
  }

  useEffect(() => {
    fetchCustomerHandle(customerId, accessToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, accessToken])

  return (
    <CustomerContext.Provider
      value={{
        ...state,
        customerId,
        accessToken,
        endpoint,
        domain,
        refetchCustomer: async () => {
          return await fetchCustomerHandle(customerId, accessToken)
        },
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}
