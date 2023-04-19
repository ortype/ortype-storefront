import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { getSalesChannelToken } from '@commercelayer/js-auth'

// NOTE: sales channel applications can read resource lists only for SKUs, SKU options, prices, promotions, and bundles
/*
code
: 
"UNAUTHORIZED"
detail
: 
"You are not authorized to perform this action on the requested resource."
resource
: 
"orders"
status
: 
"401"
*/

type UseGetToken = {
  (args: {
    clientId: string
    endpoint: string
    scope?: string
    // countryCode: string
  }): string
}

export const useGetToken: UseGetToken = ({
  clientId,
  endpoint,
  scope = 'market:12213',
}) => {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getCookieToken = Cookies.get(`clAccessToken`)
    if (!getCookieToken && clientId && endpoint) {
      const getToken = async () => {
        const auth = await getSalesChannelToken({
          clientId,
          endpoint,
          scope,
        })
        setToken(auth?.accessToken as string) // TODO: add to LocalStorage
        Cookies.set(`clAccessToken`, auth?.accessToken as string, {
          // @ts-ignore
          expires: auth?.expires,
        })
        console.log('My access token: ', auth?.accessToken)
        console.log('Expiration date: ', auth?.expires)
      }
      getToken()
    } else {
      setToken(getCookieToken || '')
    }
  })
  return token
}
