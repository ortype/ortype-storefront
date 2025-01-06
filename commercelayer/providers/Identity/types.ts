import { CustomerTokenData } from '@/commercelayer/utils/oauthStorage'
import type { Settings } from 'CustomApp'

export interface IdentityProviderState {
  settings: Settings
  isLoading: boolean
}

export interface IdentityProviderValue {
  settings: Settings
  config: CommerceLayerAppConfig
  handleLogin: (data: CustomerTokenData) => void
  handleLogout: () => void
}
