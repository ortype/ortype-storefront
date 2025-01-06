import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import type {
  IdentityProviderState,
  IdentityProviderValue
} from './types'
import type { ChildrenElement } from 'CustomApp'
import { reducer } from './reducer'
import { getSettings } from '@/commercelayer/utils/getSettings'
import { getStoredTokenKey, setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'

/*
// @TODO: implement error page and loading skeleton (optional?)
import { PageErrorLayout } from '@/commercelayer/components/layouts/PageErrorLayout'
import { DefaultSkeleton as DefaultSkeletonFC } from '@/commercelayer/components/DefaultSkeleton'
import {
  SkeletonTemplate,
  withSkeletonTemplate
} from '@/commercelayer/components/SkeletonTemplate'
*/

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
export const useIdentityContext = (): IdentityProviderValue =>
  useContext(IdentityContext)

export function IdentityProvider({
  config,
  children
}: IdentityProviderProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true
  } as IdentityProviderState)

  const [userMode, setUserMode] = useState(false)

  const clientId = config.clientId ?? ''
  const scope = config.marketId ?? ''
  const returnUrl = config.returnUrl ?? ''

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
  }, [clientId, scope, userMode])

  if (clientId.length === 0 || scope.length === 0 || returnUrl.length === 0) {
    return (
      <div>Error 500 - Missing required parameter.</div>
    )
  }

  if (state.isLoading) {
    // Skeleton loader
    return (
      <div>Loading</div>
    )
  }

  if (!state.settings?.isValid) {
    return <div>Error 500 - Application error.</div>
  }

  const value: IdentityProviderValue = {
    settings: state.settings,
    config,
    handleLogin: (tokenData) => {
      setStoredCustomerToken({ app: 'identity', clientId, slug: config.selfHostedSlug, scope, tokenData }) 
      setUserMode(true)
    },
    handleLogout: () => {
      const storageKey = getStoredTokenKey({ app: 'identity', slug: config.selfHostedSlug, scope })
      localStorage.removeItem(storageKey)
      setUserMode(false)
    }
  }
  return (
    <IdentityContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </IdentityContext.Provider>
  )
}
