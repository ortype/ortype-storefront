import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import CommerceLayer from '@commercelayer/sdk'
import type {
  IdentityProviderState,
  IdentityProviderValue,
  CustomerStateData
} from './types'
import type { ChildrenElement } from 'CustomApp'
import { reducer } from './reducer'
import { getSettings } from '@/commercelayer/utils/getSettings'
import { getStoredTokenKey, setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'
import { getCustomerDetails } from '@/commercelayer/utils/getCustomerDetails'

const initialCustomerState: CustomerStateData = {
  email: '',
  hasPassword: false,
  isLoading: true,
  userMode: false
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
  children
}: IdentityProviderProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true,
    settings: {}
  } as IdentityProviderState)

  // store customer email, userMode, etc.
  const [customer, setCustomer] = useState(initialCustomerState)

  const clientId = config.clientId ?? ''
  const scope = config.scope ?? ''
  const returnUrl = config.returnUrl ?? ''

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

  // get customer
  const fetchCustomerHandle = async (
    customerId?: string,
    accessToken?: string
  ) => {
    if (!customerId || !accessToken) {
      return
    }
    setCustomer({ ...customer, isLoading: true })

    const client = CommerceLayer({
      accessToken: state.settings.accessToken,
      organization: config.selfHostedSlug,
      domain: config.domain,
    })

    return await getCustomerDetails({
      client,
      customerId,
    }).then((customerResponse) => {
      const customerDetails = customerResponse?.object
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
    fetchCustomerHandle(state.settings.customerId, state.settings.accessToken)
  }, [state.settings.customerId, state.settings.accessToken])

  if (clientId.length === 0 || scope.length === 0 || returnUrl.length === 0) {
    return (
      <div>Error 500 - Missing required parameter.</div>
    )
  }

  // @TODO: remove isLoading and isValid returns, so the entire app doesn't rerender 
  // because we wrap the entire app, we need to check ctx.isLoading and ctx.settings.isValid
  
  /*
  if (state.isLoading) {
    // Skeleton loader
    return (
      <div>Loading</div>
    )
  }

  if (!state.settings?.isValid) {
    return <div>Error 500 - Application error.</div>
  }
  */

  const value: IdentityProviderValue = {
    settings: state.settings,
    isLoading: state.isLoading,
    customer,
    config,
    handleLogin: (tokenData) => {
      setStoredCustomerToken({ app: 'identity', clientId, slug: config.selfHostedSlug, scope, tokenData }) 
      setCustomer({ ...customer, userMode: true })
    },
    handleLogout: () => {
      const storageKey = getStoredTokenKey({ app: 'identity', slug: config.selfHostedSlug, scope })
      localStorage.removeItem(storageKey)
      setCustomer({...initialCustomerState, isLoading: false, userMode: false })
    }
  }
  return (
    <IdentityContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </IdentityContext.Provider>
  )
}
