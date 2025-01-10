import CommerceLayer from '@commercelayer/sdk'
import type { Settings, InvalidSettings } from 'CustomApp'

import { getOrganization } from './getOrganization'
import { getStoredSalesChannelToken } from './oauthStorage'
import { getInfoFromJwt } from './getInfoFromJwt'

// default settings are by their nature not valid to show My Account data
// they will be used as fallback for errors or 404 page
export const defaultSettings: InvalidSettings = {
  primaryColor: '#000000',
  logoUrl: '',
  faviconUrl:
    'https://data.commercelayer.app/assets/images/favicons/favicon-32x32.png',
  companyName: 'Or Type',
  isValid: false,
  retryable: false
}

const makeInvalidSettings = (): InvalidSettings => ({
  ...defaultSettings,
  retryable: false
})

type GetSettingsProps = Pick<Settings, 'clientId' | 'scope'> & {
  config: CommerceLayerAppConfig
}

/**
 * Retrieves a list of `Settings` required to show the identity app
 *
 * @param clientId - Commerce Layer application's clientId.
 * @param scope - Commerce Layer access token scope (market, stock location).
 * @param config - Commerce Layer app configuration available from global window object.
 * Read more at {@link https://docs.commercelayer.io/developers/authentication/client-credentials#sales-channel}, {@link https://docs.commercelayer.io/core/authentication/password}
 *
 * @returns an union type of `Settings` or `InvalidSettings`
 */
export const getSettings = async ({
  clientId,
  scope,
  config
}: GetSettingsProps): Promise<Settings | InvalidSettings> => {
  const slug = config.selfHostedSlug || '' // only undefined if config isn't passed in
  const domain = config.domain

  const storedToken = await Promise.resolve(
    getStoredSalesChannelToken({
      app: 'identity',
      slug,
      domain,
      clientId,
      scope
    })
  )

  if (!storedToken || !storedToken.access_token) {
    console.warn('Identity: getSettings: storedToken/access_token is missing.')
    return makeInvalidSettings()
  }

  if (storedToken?.error != null) {
    console.warn('Identity: getSettings: token error.')
    return makeInvalidSettings()
  }

  const { customerId } = getInfoFromJwt(storedToken.access_token)

  const client = CommerceLayer({
    organization: slug,
    accessToken: storedToken?.access_token ?? '',
    domain
  })

  const organization = await Promise.resolve(
    getOrganization({
      client
    })
  )

  // validating organization
  if (organization == null) {
    console.warn('Identity: getSettings: Fetching organization probably failed due to invalid credentials')
    return makeInvalidSettings()
  }

  return {
    accessToken: storedToken?.access_token ?? '',
    isGuest: !customerId,
    customerId: customerId,
    endpoint: config.domain,
    isValid: true,
    language: 'en',
    companyName: organization?.name ?? defaultSettings.companyName,
    primaryColor: organization?.primary_color ?? defaultSettings.primaryColor,
    logoUrl: organization?.logo_url ?? '',
    faviconUrl: organization?.favicon_url ?? defaultSettings.faviconUrl
  }
}
