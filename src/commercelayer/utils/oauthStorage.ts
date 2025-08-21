import {
  authenticate,
  jwtDecode,
  jwtIsSalesChannel,
} from '@commercelayer/js-auth'

export interface StoredOauthResponse {
  access_token?: string
  refresh_token?: string
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
  client_id?: string
  expires?: number
  owner_type?: string
  owner_id?: string
}

interface GetStoredTokenKeyConfig {
  app: string
  slug: string
  scope: string
}

export const getStoredTokenKey = ({
  app,
  slug,
  scope,
}: GetStoredTokenKeyConfig): string => {
  return `cLayer-${app}-${slug}-${scope}`
}

interface GetStoredTokenDataConfig extends GetStoredTokenKeyConfig {}

const getStoredTokenData = ({
  app,
  slug,
  scope,
}: GetStoredTokenDataConfig): StoredOauthResponse | null => {
  const storageKey = getStoredTokenKey({ app, slug, scope })
  const storageContent = localStorage.getItem(storageKey) ?? ''
  if (storageContent?.includes('{')) {
    return JSON.parse(storageContent)
  }
  return null
}

interface IsTokenExpiredConfig {
  expires?: number
}

const isTokenExpired = ({ expires = 0 }: IsTokenExpiredConfig): boolean => {
  return Math.trunc(new Date().getTime() / 1000) > expires
}

interface IsValidStoreTokenDataConfig {
  tokenData: StoredOauthResponse | null
  clientId: string
}

const isValidStoredTokenData = ({
  tokenData,
  clientId,
}: IsValidStoreTokenDataConfig): boolean => {
  return (
    tokenData != null &&
    clientId === tokenData?.client_id &&
    !isTokenExpired({ expires: tokenData?.expires })
    // TODO: Check also if token is not about to expire in XXX seconds (TBD)
  )
}

interface GetStoredSalesChannelTokenConfig {
  app: string
  slug: string
  domain: string
  clientId: string
  scope: string
}

interface CustomerStoredTokenData {
  access_token: string
  token_type: string
  expires: number
  refresh_token: string
  scope: string
  created_at: number
  owner_id: string
  owner_type: string
}

export interface CustomerTokenData {
  accessToken: string
  tokenType: string
  refreshToken: string
  scope: string
  createdAt: number
  ownerId: string
  ownerType: string
  expires: number
}

interface SetStoredSalesChannelTokenConfig {
  app: string
  slug: string
  domain: string
  clientId: string
  scope: string
  tokenData: CustomerTokenData
}

export const setStoredCustomerToken = ({
  app,
  slug,
  domain,
  clientId,
  scope,
  tokenData,
}: SetStoredSalesChannelTokenConfig): null => {
  if (tokenData?.accessToken != null && clientId) {
    const decodedJWT = jwtDecode(tokenData.accessToken)
    // @NOTE: this clientId check could match `isValidStoredTokenData` check if we grab the current
    // localStorage and compare (this is in case clientId could possibly change I believe)
    const customerTokenData: StoredOauthResponse = {
      client_id: clientId,
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
      expires: decodedJWT.payload.exp,
      scope: scope,
      token_type: tokenData.tokenType,
      owner_type: tokenData.ownerType,
      owner_id: tokenData.ownerId,
    }
    const storageKey = getStoredTokenKey({ app, slug, scope })
    localStorage.setItem(storageKey, JSON.stringify(customerTokenData))
  }
  return null
}

// TODO: Define if storageKey needs a naming differentiation for sales channel tokens and customer tokens
export const getStoredSalesChannelToken = async ({
  app,
  slug,
  domain,
  clientId,
  scope,
}: GetStoredSalesChannelTokenConfig): Promise<StoredOauthResponse | null> => {
  const tokenData = getStoredTokenData({ app, slug, scope })
  if (!isValidStoredTokenData({ tokenData, clientId })) {
    try {
      const auth = await authenticate('client_credentials', {
        domain,
        clientId,
        scope,
      })
      if (auth.accessToken != null) {
        const decodedJWT = jwtDecode(auth.accessToken)
        const slug = jwtIsSalesChannel(decodedJWT.payload)
          ? decodedJWT.payload.organization.slug
          : ''

        const tokenData: StoredOauthResponse = {
          client_id: clientId,
          access_token: auth.accessToken,
          scope,
          token_type: auth.tokenType,
          expires: decodedJWT.payload.exp,
        }
        const storageKey = getStoredTokenKey({ app, slug, scope })
        localStorage.setItem(storageKey, JSON.stringify(tokenData))
        return tokenData
      } else {
        return null
      }
    } catch (err) {
      return null
    }
  } else {
    return tokenData
  }
}
