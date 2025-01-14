import CommerceLayer from '@commercelayer/sdk'

export interface CommerceLayerConfig {
  accessToken?: string
  domain?: string
  organization?: string
}

export default function getCommerceLayer({
  domain,
  accessToken,
  organization,
}: CommerceLayerConfig): ReturnType<typeof client> {
  if (accessToken == null || domain == null || organization == null)
    throw new Error(
      'accessToken, domain, and organization are required parameters'
    )
  return CommerceLayer({
    accessToken,
    domain,
    organization,
  })
}
