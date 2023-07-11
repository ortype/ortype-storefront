import CommerceLayer from '@commercelayer/sdk'
import {
  CartSettings,
  InvalidCartSettings,
  UseCartSettingsOrInvalid,
} from 'CustomApp'
import React, { useContext, useEffect, useState } from 'react'
import { getCartSettings } from 'utils/getCartSettings'
import { getOrderDetails } from 'utils/getOrderDetails'
import { isValidOrderIdFormat } from 'utils/isValidOrderIdFormat'
import { isValidStatus } from 'utils/isValidStatus'
// import { useLocalStorageToken } from './useLocalStorageToken'
import Cookies from 'js-cookie'

// default settings are by their nature not valid to show a full cart
// they will be used as fallback for errors or 404 page
export const defaultSettings: UseCartSettingsOrInvalid = {
  orderId: false,
  isValid: false,
  retryable: false,
}

const makeInvalidCartSettings = ({
  retryable,
}: // organization,
{
  retryable?: boolean
  // organization?: Organization
}): InvalidCartSettings => ({
  ...defaultSettings,
  retryable: !!retryable,
})

// @TODO: We may want to copy the syncAccessToken and getCartSettings pattern from the Checkout's useSettingsOrInvalid

export const useCartSettingsOrInvalid = ({
  accessToken,
  domain,
  slug,
}): UseCartSettingsOrInvalid => {
  const [settings, setSettings] = useState<
    CartSettings | InvalidCartSettings | undefined
  >(undefined)
  const [isFetching, setIsFetching] = useState(true)

  // this bit checks the accessToken localStorage and updates it if not synced
  /*
  const [savedAccessToken, setAccessToken] = useLocalStorageToken(
    // @TODO: use the same localstorage key as the rest of the app (?)
    'checkoutAccessToken',
    accessToken as string
  )

  useEffect(() => {
    if (accessToken && accessToken !== savedAccessToken) {
      setAccessToken(accessToken)
    }
  }, [accessToken])
  
  const syncedAccessToken =
    accessToken === savedAccessToken || (!accessToken && savedAccessToken)
  
  */

  const getCookieToken = Cookies.get(`clAccessToken`)
  const syncedAccessToken =
    accessToken === getCookieToken || (!accessToken && getCookieToken)

  const orderId = localStorage.getItem('order')

  useEffect(() => {
    if (syncedAccessToken) {
      setIsFetching(true)
      getCartSettings({
        // accessToken: savedAccessToken, // maybe we can get the accessToken inside this getCheckoutSettings
        accessToken,
        domain,
        slug,
        orderId: orderId as string,
      }).then((fetchedSettings) => {
        setSettings(fetchedSettings)
        setIsFetching(false)
      })
    }
  }, [syncedAccessToken])

  if (isFetching) {
    return { isLoading: true, settings: undefined }
  }

  if (settings && !settings.validCart) {
    if (!settings.retryOnError) {
      // navigate("/404")
    }
    return { settings: undefined, retryOnError: true, isLoading: false }
  }

  return {
    settings,
    isLoading: false,
  }
}
