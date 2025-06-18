'use client'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { getCustomerDetails } from '@/commercelayer/utils/getCustomerDetails'
import { getSettings } from '@/commercelayer/utils/getSettings'
import {
  getStoredTokenKey,
  setStoredCustomerToken,
} from '@/commercelayer/utils/oauthStorage'
import type { ChildrenElement } from 'CustomApp'
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { reducer } from './reducer'
import type {
  CLayerClientConfig,
  CustomerStateData,
  IdentityProviderState,
  IdentityProviderValue,
} from './types'

const initialCustomerState: CustomerStateData = {
  email: '',
  hasPassword: false,
  isLoading: true,
  userMode: false,
}

interface IdentityProviderProps {
  /**
   * If needed, context value can be also accessed using a function as a child.
   *
   * Example:
   * ```
   * <IdentityProvider config={config}>
   *  {(ctx) => <div>identity</div>}
   * </IdentityProvider>
   * ```
   */
  children:
    | ((props: IdentityProviderValue) => ChildrenElement)
    | ChildrenElement
  config: CommerceLayerAppConfig
}

const IdentityContext = createContext<IdentityProviderValue>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as IdentityProviderValue
)
// @TODO: rename to something like `useCLayerSettings`
export const useIdentityContext = (): IdentityProviderValue =>
  useContext(IdentityContext)

export function IdentityProvider({
  config,
  children,
}: IdentityProviderProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true,
    settings: {},
  } as IdentityProviderState)

  // store customer email, userMode, etc.
  const [customer, setCustomer] = useState(initialCustomerState)

  const clientId = config.clientId ?? ''
  const scope = config.scope ?? ''

  const clientConfig = {
    accessToken: state.settings.accessToken,
    domain: config.domain,
    organization: config.slug,
  }

  // get global CL settings and accessToken
  useEffect(() => {
    dispatch({ type: 'identity/onLoad' })

    if (clientId != null && scope != null) {
      getSettings({ clientId, scope, config })
        .then((settings) => {
          if (settings.isValid) {
            dispatch({ type: 'identity/loaded', payload: settings })
          } else {
            dispatch({ type: 'identity/onError' })
          }
        })
        .catch(() => {
          dispatch({ type: 'identity/onError' })
        })
    }
  }, [clientId, scope, customer.userMode])

  // get customer using API route (secure server-side lookup)
  const lookupCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customer/${customerId}`)
      const data = await response.json()

      if (data.success && data.customer) {
        // Update customer state with the lookup result
        setCustomer({
          ...customer,
          userMode: true,
          email: data.customer.email,
          hasPassword: data.customer.hasPassword,
          isLoading: false,
        })
      }

      return data
    } catch (error) {
      console.error('Customer lookup error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to lookup customer',
      }
    }
  }

  // get customer using client-side token (for authenticated users)
  const fetchCustomerHandle = async (customerId?: string) => {
    console.log('fetchCustomerHandle: ', customerId)
    const client = isValidCommerceLayerConfig(clientConfig)
      ? getCommerceLayer(clientConfig)
      : undefined
    if (!customerId || client == null) {
      return
    }
    setCustomer({ ...customer, isLoading: true })

    return await getCustomerDetails({
      client,
      customerId,
    }).then((customerResponse) => {
      const customerDetails = customerResponse?.object
      console.log('getCustomerDetails.then: ', customerResponse)
      setCustomer({
        ...customer,
        userMode: true,
        email: customerDetails?.email ?? '',
        hasPassword: customerDetails?.has_password ?? false,
        isLoading: false,
      })
    })
  }

  useEffect(() => {
    console.log(
      'does this ever run?',
      state.settings.accessToken,
      state.settings.customerId
    )
    state.settings.accessToken && fetchCustomerHandle(state.settings.customerId)
  }, [state.settings.customerId, state.settings.accessToken])

  if (clientId.length === 0 || scope.length === 0) {
    console.log('IdentityProvider: Missing required parameter.')
    // return <div>Error 500 - Missing required parameter.</div>
  }

  const value: IdentityProviderValue = {
    settings: state.settings,
    isLoading: state.isLoading,
    customer,
    clientConfig,
    config,
    handleLogin: (tokenData) => {
      setStoredCustomerToken({
        app: 'identity',
        clientId,
        slug: config.slug,
        scope,
        tokenData,
      })
      setCustomer({ ...customer, userMode: true })
    },
    handleLogout: () => {
      const storageKey = getStoredTokenKey({
        app: 'identity',
        slug: config.slug,
        scope,
      })
      localStorage.removeItem(storageKey)
      setCustomer({
        ...initialCustomerState,
        isLoading: false,
        userMode: false,
      })
    },
    lookupCustomer,
    setCustomerEmail: (email) => {
      setCustomer({
        ...initialCustomerState,
        email,
        isLoading: false,
        userMode: false,
      })
    },
  }
  return (
    <IdentityContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </IdentityContext.Provider>
  )
}
