'use client'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
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
  CustomerStateData,
  IdentityProviderState,
  IdentityProviderValue,
} from './types'
import { getCustomerDetails } from './utils/getCustomerDetails'
import { getSettings } from './utils/getSettings'

const initialCustomerState: CustomerStateData = {
  email: '',
  hasPassword: false,
  isLoading: true,
  userMode: false,
  checkoutEmail: '',
  checkoutEmailHasAccount: false,
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

/*
@TODO: DRY up config, clientConfig, settings, customer
Current:
- config (static)
- clientConfig which is a mix of `config` + accessToken
- settings which is accessToken + customerId + + isGuest + isValid
- customer which is `email, hasPassword, isLoading, userMode, checkoutEmail, checkoutEmailHasAccount`
Future:
- config (static)
- settings.accessToken (or accessToken directly as a prop)
-- review any usage of `customerId` `isGuest` in consuming components
- customer (review overlap of email and checkoutEmail)
*/

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
    organization: config.slug, // known as `slug` as well
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

  // get customer using client-side token (for authenticated users)
  const fetchCustomerHandle = async (customerId?: string) => {
    console.log('🔍 [IdentityProvider] fetchCustomerHandle: ', customerId)
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
      console.log(
        '🔍 [IdentityProvider] getCustomerDetails.then: ',
        customerResponse
      )
      setCustomer({
        ...customer,
        userMode: true,
        email: customerDetails?.email ?? '',
        hasPassword: customerDetails?.has_password ?? false,
        isLoading: false,
      })
    })
  }

  // fetch customer handle if custoemrId or accessToken changes
  useEffect(() => {
    state.settings.accessToken && fetchCustomerHandle(state.settings.customerId)
  }, [state.settings.customerId, state.settings.accessToken])

  // Reset customer loading state when provider finishes loading and there's no authenticated session
  useEffect(() => {
    if (!state.isLoading && !state.settings.customerId && customer.isLoading) {
      console.log(
        '🔍 [IdentityProvider] Resetting customer isLoading to false - no authenticated session'
      )
      setCustomer((prev) => ({ ...prev, isLoading: false }))
    }
  }, [state.isLoading, state.settings.customerId, customer.isLoading])

  if (clientId.length === 0 || scope.length === 0) {
    console.log('🔍 [IdentityProvider]: Missing required parameter.')
    // return <div>Error 500 - Missing required parameter.</div>
  }

  // Check if an email belongs to an existing customer with a password
  const checkCustomerEmail = async (email: string): Promise<boolean> => {
    console.log('🔍 [IdentityProvider] checkCustomerEmail called:', email)

    setCustomer((prev) => ({
      ...prev,
      isLoading: true,
      checkoutEmail: email,
    }))

    try {
      const response = await fetch('/api/customer-exists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log('🔍 [IdentityProvider] checkCustomerEmail result:', data)

      const hasAccount = data.success && data.exists && data.hasPassword

      setCustomer((prev) => ({
        ...prev,
        checkoutEmail: email,
        checkoutEmailHasAccount: hasAccount,
        isLoading: false,
      }))

      return hasAccount
    } catch (error) {
      console.error('🔍 [IdentityProvider] checkCustomerEmail error:', error)
      setCustomer((prev) => ({
        ...prev,
        checkoutEmail: email,
        checkoutEmailHasAccount: false,
        isLoading: false,
      }))
      return false
    }
  }

  const value: IdentityProviderValue = {
    settings: state.settings,
    isLoading: state.isLoading,
    customer,
    clientConfig,
    config,
    handleLogin: async (tokenData) => {
      setStoredCustomerToken({
        app: 'identity',
        clientId,
        slug: config.slug,
        scope,
        tokenData,
      })

      // Update clientConfig with the new access token
      const updatedClientConfig = {
        ...clientConfig,
        accessToken: tokenData.accessToken,
      }

      // Fetch full customer details using the new token
      if (tokenData.ownerId) {
        const client = isValidCommerceLayerConfig(updatedClientConfig)
          ? getCommerceLayer(updatedClientConfig)
          : undefined

        if (client) {
          try {
            const customerResponse = await getCustomerDetails({
              client,
              customerId: tokenData.ownerId,
            })

            const customerDetails = customerResponse?.object
            const customerEmail = customerDetails?.email ?? ''
            setCustomer({
              ...customer,
              userMode: true,
              email: customerEmail,
              hasPassword: customerDetails?.has_password ?? false,
              isLoading: false,
              // Sync checkout state - user just logged in, so they have an account
              checkoutEmail: customerEmail,
              checkoutEmailHasAccount: true,
            })
          } catch (error) {
            console.error(
              'Failed to fetch customer details after login:',
              error
            )
            // Fallback to just setting userMode if fetching details fails
            setCustomer((prev) => ({
              ...prev,
              userMode: true,
              isLoading: false,
              // Still mark as having account since login succeeded
              checkoutEmailHasAccount: true,
            }))
          }
        } else {
          setCustomer((prev) => ({
            ...prev,
            userMode: true,
            isLoading: false,
            checkoutEmailHasAccount: true,
          }))
        }
      } else {
        setCustomer((prev) => ({
          ...prev,
          userMode: true,
          isLoading: false,
          checkoutEmailHasAccount: true,
        }))
      }
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
        // Reset checkout state on logout
        checkoutEmail: undefined,
        checkoutEmailHasAccount: undefined,
      })
    },
    fetchCustomerHandle,
    checkCustomerEmail,
    setCustomerEmail: (email) => {
      setCustomer({
        ...initialCustomerState,
        email,
        isLoading: false,
        userMode: false,
      })
      // Also check if this email has an existing account
      checkCustomerEmail(email)
    },
  }
  return (
    <IdentityContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </IdentityContext.Provider>
  )
}
