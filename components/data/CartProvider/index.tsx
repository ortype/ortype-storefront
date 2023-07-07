import { InvalidCartSettings, CartSettings } from 'CustomApp'
import { changeLanguage } from 'i18next'
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

// import { parseLanguageCode } from "./i18n/parseLanguageCode"

import { defaultSettings, getCartSettings } from 'utils/getCartSettings'

type CartProviderValue = {
  /**
   * Can contains either a valid `Settings` or `InvalidSettings` object.
   * Invalid settings will be returned when part of initial API data fetching fails
   * and it's not possible to show a full cart page.
   */
  settings: CartSettings | InvalidCartSettings
  /**
   * When `true` it means that app is fetching content from API and is not ready to return the `Settings` object.
   * It can be used to control the UI state.
   */
  isLoading: boolean
}

type CartProviderProps = {
  accessToken: string
  /**
   * The required Order ID to be used to get cart information and to fill the `Settings` object.
   * Order status must be either `draft` or `pending`, otherwise an `InvalidSettings` object will be returned instead.
   *
   * Read more at {@link https://docs.commercelayer.io/developers/v/how-tos/shopping-cart/create-a-shopping-cart}
   */
  // orderId: string
  domain: string
  slug: string
  /**
   * App config served locally from public/config.js
   */
  // config: CommerceLayerAppConfig
  /**
   * If needed, context value can be also accessed using a function as a child.
   *
   * Example:
   * ```
   * <CartProvider orderId={orderId}>
   *  {(ctx) => <div>cart</div>}
   * </CartProvider>
   * ```
   */
  children: ((props: CartProviderValue) => ReactNode) | ReactNode
}

const initialValues: CartProviderValue = {
  settings: defaultSettings,
  isLoading: true,
}

export const CartContext = createContext<CartProviderValue>(initialValues)

export const useCart = (): CartProviderValue => {
  const ctx = useContext(CartContext)
  return {
    settings: ctx.settings,
    isLoading: !!ctx.isLoading,
  }
}

export const CartProvider: FC<CartProviderProps> = ({
  accessToken,
  domain,
  slug,
  children,
}) => {
  const [settings, setSettings] = useState<CartSettings | InvalidCartSettings>(
    defaultSettings
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(!!accessToken)

    if (accessToken) {
      getCartSettings({ accessToken, domain, slug })
        .then(setSettings)
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [accessToken])

  // keep i18n in sync
  /*
  useEffect(() => {
    if (settings.language) {
      changeLanguage(parseLanguageCode(settings.language))
    }
  }, [settings.language])
  */

  const value = { settings, isLoading }
  return (
    <CartContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </CartContext.Provider>
  )
}
