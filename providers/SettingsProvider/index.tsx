import type { InvalidSettings, Settings } from 'CustomApp'
import { useGetToken } from 'hooks/GetToken'
import { defaultSettings, getSettings } from 'lib/utils/getSettings'
import { createContext, useContext, useEffect, useState } from 'react'

interface SettingsProviderValue {
  settings: Settings | InvalidSettings
  isLoading: boolean
  handleLogin: (customer) => Promise<void>
  handleLogout: () => Promise<void>
  handleRegister: (customer) => Promise<void>
}

interface CommerceLayerAppConfig {
  clientId: string
  endpoint: string
  marketId: string
}

interface SettingsProviderProps {
  /**
   * If needed, context value can be also accessed using a function as a child.
   *
   * Example:
   * ```
   * <SettingsProvider config={config}>
   *  {(ctx) => <div>my-account</div>}
   * </SettingsProvider>
   * ```
   */
  children:
    | ((props: SettingsProviderValue) => React.ReactNode)
    | React.ReactNode
  config: CommerceLayerAppConfig
  handleLogin: () => void
  handleLogout: () => void
  handleRegister: () => void
}

const initialValues: SettingsProviderValue = {
  settings: defaultSettings,
  isLoading: true,
}

export const SettingsContext =
  createContext<SettingsProviderValue>(initialValues)

export const useSettings = (): SettingsProviderValue => {
  const ctx = useContext(SettingsContext)
  return {
    // @TODO: add user/customer data to ctx
    settings: ctx.settings,
    isLoading: !!ctx.isLoading,
    handleLogin: ctx.handleLogin,
    handleLogout: ctx.handleLogout,
    handleRegister: ctx.handleRegister,
  }
}

interface SettingsStateData {
  customer: object
  userMode: boolean
}

const initialState: SettingsStateData = {
  customer: {},
  userMode: false,
}

export function SettingsProvider({
  config,
  children,
}: SettingsProviderProps): JSX.Element {
  const [userState, setUserState] = useState(initialState)

  const [settings, setSettings] = useState<Settings | InvalidSettings>(
    defaultSettings
  )
  const [isLoading, setIsLoading] = useState(true)

  // const accessToken = getAccessTokenFromUrl()
  // useGetToken gets a cookie with the token if present, otherwise it requests a token with these params
  console.log('userState: ', userState)
  const accessToken = useGetToken({
    clientId: config.clientId,
    endpoint: config.endpoint,
    scope: config.marketId,
    customer: userState.customer,
    userMode: userState.userMode,
  })

  useEffect(() => {
    setIsLoading(!!accessToken)

    if (accessToken) {
      getSettings({ accessToken, config })
        .then(setSettings)
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [accessToken])

  const value = { settings, isLoading, user: userState }
  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        handleLogin: (customer) => {
          setUserState({ ...userState, userMode: true, customer })
        },
        handleLogout: () => {
          setUserState({ ...userState, userMode: false, customer: {} })
        },
        handleRegister: (customer) => {
          setUserState({ ...userState, userMode: true, customer })
        },
      }}
    >
      {typeof children === 'function' ? children(value) : children}
    </SettingsContext.Provider>
  )
}
