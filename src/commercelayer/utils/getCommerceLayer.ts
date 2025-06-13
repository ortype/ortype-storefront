import CommerceLayer from '@commercelayer/sdk'

export interface CommerceLayerConfig {
  accessToken?: string
  domain?: string
  organization?: string
}

// Helper function to validate config before calling getCommerceLayer
export function isValidCommerceLayerConfig(
  config: CommerceLayerConfig | null | undefined
): config is Required<CommerceLayerConfig> {
  return (
    config != null &&
    config.accessToken != null &&
    config.domain != null &&
    config.organization != null
  )
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
