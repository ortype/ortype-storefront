// import { getSubdomain } from 'utils/getSubdomain'
import { SettingsContext } from 'components/data/SettingsProvider'
import { useContext, useEffect, useState } from 'react'
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

// import { useParams } from 'next/navigation' // only avaiable with /app directory
import { useRouter } from 'next/router'
import { getCheckoutSettings } from 'utils/getCheckoutSettings'

import Cookies from 'js-cookie'
// import { useLocalStorageToken } from './useLocalStorageToken'

interface UseSettingsOrInvalid {
  settings?: CheckoutSettings
  retryOnError?: boolean
  isLoading: boolean
}

export const useSettingsOrInvalid = (): UseSettingsOrInvalid => {
  const {
    query: { orderId },
  } = useRouter()
  // const paymentReturn = searchParams.get('paymentReturn')
  // const redirectResult = searchParams.get('redirectResult')
  // In the Checkout App these params are being parsed from the URL params
  // like the accessToken, which my Buy/Cart page generates
  // Here we can use CustomerContext or const settingsCtx = useContext(SettingsContext)
  const { settings: settingsCtx } = useContext(SettingsContext)
  const {
    accessToken,
    endpoint,
    domain,
    slug,
    subdomain,
    companyName,
    language,
    primaryColor,
    logoUrl,
    faviconUrl: favicon,
    gtmId,
    supportEmail,
    supportPhone,
  } = settingsCtx
  // @TODO: consider merging the Settings from checkout and account

  const paymentReturn = ''
  const redirectResult = ''
  const [settings, setSettings] = useState<
    CheckoutSettings | InvalidCheckoutSettings | undefined
  >(undefined)
  const [isFetching, setIsFetching] = useState(true)

  const getCookieToken = Cookies.get(`clAccessToken`)

  const isPaymentReturn = paymentReturn === 'true' || !!redirectResult

  const syncedAccessToken =
    accessToken === getCookieToken || (!accessToken && getCookieToken)

  useEffect(() => {
    if (syncedAccessToken) {
      setIsFetching(true)
      getCheckoutSettings({
        // accessToken: savedAccessToken, // maybe we can get the accessToken inside this getCheckoutSettings
        accessToken,
        endpoint,
        domain,
        slug,
        subdomain,
        companyName,
        language,
        primaryColor,
        logoUrl,
        faviconUrl: favicon,
        gtmId,
        supportEmail,
        supportPhone,
        orderId: orderId as string,
        paymentReturn: isPaymentReturn,
        // subdomain: getSubdomain(window.location.hostname),
      }).then((fetchedSettings) => {
        setSettings(fetchedSettings)
        setIsFetching(false)
      })
    }
  }, [syncedAccessToken])

  // No accessToken in URL
  if (!isPaymentReturn && accessToken === null) {
    // navigate("/404")
    return { settings: undefined, isLoading: false }
  }

  if (isFetching) {
    return { isLoading: true, settings: undefined }
  }

  if (settings && !settings.validCheckout) {
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
