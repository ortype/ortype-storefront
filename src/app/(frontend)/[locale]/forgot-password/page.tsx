import { authenticate } from '@commercelayer/js-auth'
import { unstable_cache } from 'next/cache'
import ForgotPassword from './forgot-password'

const getAuthToken = unstable_cache(async () => {
  try {
    const token = await authenticate('client_credentials', {
      clientId: process.env.CL_SYNC_CLIENT_ID || '',
      clientSecret: process.env.CL_SYNC_CLIENT_SECRET || '',
    })

    if (token?.accessToken?.length) {
      return token.accessToken
    }
  } catch (e) {
    console.log('getAuthToken error: ', e)
  }
  return null
}, ['commerce-layer-accesstoken'])

export default async function RouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const accessToken = (await getAuthToken()) || ''
  return <ForgotPassword accessToken={accessToken}>{children}</ForgotPassword>
}
