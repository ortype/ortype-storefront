import CommerceLayer from '@commercelayer/sdk'
import CommerceLayerUtils, { executeBatch } from '@commercelayer/sdk-utils'

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
  const cl = CommerceLayer({
    accessToken,
    domain,
    organization,
  })
  // https://github.com/commercelayer/commercelayer-sdk-utils#sdk-v6x
  CommerceLayerUtils(cl)
  return cl
}
