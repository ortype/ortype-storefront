import { CustomerTokenData } from '@/commercelayer/utils/oauthStorage'
import type { Settings } from 'CustomApp'

export interface IdentityProviderState {
  settings: Settings
  isLoading: boolean
}

export interface IdentityProviderValue {
  settings: Settings
  isLoading: boolean
  customer: CustomerStateData 
  config: CommerceLayerAppConfig
  handleLogin: (data: CustomerTokenData) => void
  handleLogout: () => void
}

export interface CustomerStateData {
  email: string
  hasPassword: boolean
  isLoading: boolean
  userMode: boolean
}
