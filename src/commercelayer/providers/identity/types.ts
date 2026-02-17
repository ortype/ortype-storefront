import { CustomerTokenData } from '@/commercelayer/utils/oauthStorage'
import type { Customer } from '@commercelayer/sdk'
import type { Settings } from 'CustomApp'

export interface CLayerClientConfig {
  accessToken?: string
  domain?: string
  organization?: string
}

export interface IdentityProviderState {
  settings: Settings
  isLoading: boolean
}

export interface IdentityProviderValue {
  settings: Settings
  isLoading: boolean
  customer: CustomerStateData
  config: CommerceLayerAppConfig
  clientConfig: CLayerClientConfig
  handleLogin: (data: CustomerTokenData) => Promise<void>
  handleLogout: () => void
  fetchCustomerHandle: (customerId?: string) => Promise<Customer | undefined>
  setCustomerEmail: (email: string) => void
  checkCustomerEmail: (email: string) => Promise<boolean>
}

export interface CustomerStateData {
  email: string
  hasPassword: boolean
  isLoading: boolean
  userMode: boolean
  checkoutEmail?: string
  checkoutEmailHasAccount?: boolean
}
