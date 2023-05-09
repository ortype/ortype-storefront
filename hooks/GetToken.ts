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
    customer: object
    // countryCode: string
  }): string
}

export const useGetToken: UseGetToken = ({
  clientId,
  endpoint,
  customer,
  userMode = false,
  scope = 'market:12213',
}) => {
  const [token, setToken] = useState('')
  const user = userMode
    ? {
        username: customer.username,
        password: customer.password,
      }
    : undefined

  console.log('user: ', user)
  useEffect(() => {
    const getCookieToken = Cookies.get(`clAccessToken`)
    if (!getCookieToken && clientId && endpoint) {
      const getToken = async (): Promise<void> => {
        const auth = await getSalesChannelToken(
          {
            clientId,
            endpoint,
            scope,
          },
          user
        )
        console.log('getToken: ', user, auth)
        setToken(auth?.accessToken as string) // TODO: add to LocalStorage
        Cookies.set(`clAccessToken`, auth?.accessToken as string, {
          // @ts-ignore
          expires: auth?.expires,
        })
      }
      void getToken()
    } else {
      setToken(getCookieToken || '')
    }
  }, [])
  console.log('My access token: ', token)
  return token
}
