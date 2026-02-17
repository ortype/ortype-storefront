import { CLayerClientConfig } from '@/commercelayer/providers/identity/types'
import { type LineItem, type Order } from '@commercelayer/sdk'

import { z } from 'zod'

/**
 * OrderSectionEnum represents all the possible identifiers of accordion sections available in order's detail page.
 */
type OrderSectionEnum = 'Summary' | 'Addresses' | 'Shipments' | 'Payments'

export type AddressFormFields =
  | 'first_name'
  | 'last_name'
  | 'line_1'
  | 'line_2'
  | 'city'
  | 'country_code'
  | 'state_code'
  | 'zip_code'
  | 'phone'
  | 'billing_info'

declare module 'CustomApp' {
  export type ChildrenElement = JSX.Element | JSX.Element[] | null

  interface CommerceLayerAppConfig {
    clientId: string
    /**
     * Specific domain to use for Commerce Layer API requests.
     * It must be set as `commercelayer.io`.
     */
    domain: string
    /**
     * The organization slug that generates the accessToken.
     * When null it means the app is hosted by Commerce Layer.
     */
    selfHostedSlug?: string | null

    scope?: string | null

    slug?: string
    endpoint: string
    persistKey: string
  }

  interface Window {
    /**
     * Commerce Layer app configuration available from global window object
     */
    clAppConfig: CommerceLayerAppConfig
  }

  interface CheckoutSettings {
    accessToken: string
    config: CLayerClientConfig
    orderId: string
    orderNumber: number
    validCheckout: true
    endpoint: string
    domain: string
    slug: string
    logoUrl?: string
    companyName: string
    language: string
    primaryColor: HSLProps
    favicon: string
    gtmId?: string
    supportEmail?: string
    supportPhone?: string
    termsUrl?: string
    privacyUrl?: string
  }

  export type UseCheckoutSettingsOrInvalid = Pick<CheckoutSettings> & {
    /**
     * This flag allows TypeScript to discriminate between `Settings` and `InvalidSettings` union type.
     */
    isValid: false
    /**
     * When `true`, it indicates the encountered error might be temporary (eg. connectivity error)
     * and the user can manually retry by refreshing browser tab.
     */
    retryable: boolean
  }

  interface InvalidCheckoutSettings {
    validCheckout: false
    retryOnError: boolean
  }

  type CheckoutPageContextProps = Pick<
    CheckoutSettings,
    | 'accessToken'
    | 'orderId'
    | 'logoUrl'
    | 'companyName'
    | 'endpoint'
    | 'language'
    | 'primaryColor'
    | 'favicon'
    | 'gtmId'
    | 'supportEmail'
    | 'supportPhone'
    | 'termsUrl'
    | 'privacyUrl'
  >

  export type UseCartSettingsOrInvalid = Pick<CartSettings> & {
    /**
     * This flag allows TypeScript to discriminate between `Settings` and `InvalidSettings` union type.
     */
    isValid: false
    /**
     * When `true`, it indicates the encountered error might be temporary (eg. connectivity error)
     * and the user can manually retry by refreshing browser tab.
     */
    retryable: boolean
  }

  export type InvalidCartSettings = {
    validCart: false
  }

  /**
   * Settings are all the settings used by the My Account application:
   * Starting from @accessToken we can get all the settings needed
   * for the my account to work, picking them from the order and the
   * organization resources. (Organization: https://docs.commercelayer.io/core/v/api-reference/organization/object)
   */

  export interface Settings {
    /**
     * Access Token for a sales channel API credentials to be used to authenticate all Commerce Layer API requests.
     * Read more at {@link https://docs.commercelayer.io/core/authentication/client-credentials#sales-channel}, {@link https://docs.commercelayer.io/core/authentication/password}
     */
    accessToken: string
    /**
     * Base endpoint URL to be used for API requests by `@commercelayer/react-components` library.
     * Example: `https://yourdomain.commercelayer.io`
     * Read more at {@link https://docs.commercelayer.io/core/api-specification#base-endpoint}.
     */
    // endpoint: string
    /**
     * Organization name.
     * Read more at {@link https://docs.commercelayer.io/core/v/api-reference/organization/object}.
     */
    companyName?: string
    /**
     * Primary color HEX code found, if set, in current organization.
     * It will be used to generate custom CSS (example: primary button style).
     * Read more at {@link https://docs.commercelayer.io/core/v/api-reference/organization/object}.
     */
    primaryColor?: string
    /**
     * Logo URL found in current organization (if set).
     * Read more at {@link https://docs.commercelayer.io/core/v/api-reference/organization/object}.
     */
    logoUrl?: string
    /**
     * Favicon URL found, if set, in current organization.
     * Read more at {@link https://docs.commercelayer.io/core/v/api-reference/organization/object}.
     */
    faviconUrl?: string
    /**
     * The organization's Google Tag Manager ID.
     * Read more at {@link https://docs.commercelayer.io/core/v/api-reference/organization/object}.
     */
    gtmId?: string
    /**
     * The application's running language code.
     * During the application initialization the default language code is set to "en".
     */
    language: string
    /**
     * Customer Id information picked by owner?.id property inside parsed accessToken.
     * Read more at {@link https://docs.commercelayer.io/core/authentication/password}
     */
    customerId?: string
    /**
     * When `true` it indicates that current accessToken is not owned by a customer.
     * This conditional variable allows the application to show/hide or enable/disable
     * particular behaviours depending on dealing or not with a logged customer.
     */
    isGuest: boolean
    /**
     * This flag allows TypeScript to discriminate between `Settings` and `InvalidSettings` union type.
     */
    isValid: true
  }

  type InvalidSettings = Pick<
    Settings,
    'primaryColor' | 'language' | 'companyName' | 'logoUrl' | 'faviconUrl'
  > & {
    /**
     * This flag allows TypeScript to discriminate between `Settings` and `InvalidSettings` union type.
     */
    isValid: false
    /**
     * When `true`, it indicates the encountered error might be temporary (eg. connectivity error)
     * and the user can manually retry by refreshing browser tab.
     */
    retryable: boolean
  }

  interface ShipmentSelected {
    shipmentId: string
    shippingMethodId?: string
    shippingMethodName?: string
  }

  type SingleStepEnum =
    //  | 'Cart'
    | 'Email'
    | 'Address'
    | 'License'
    | 'Customer'
    | 'Shipping'
    | 'Payment'
    | 'Complete'
}

declare module 'Forms' {
  export interface LoginFormValues {
    customerEmail: string
    customerPassword: string
  }

  export interface SignUpFormValues {
    customerEmail: string
    customerPassword: string
    customerConfirmPassword: string
  }
}

const trackingLocationSchema = z.object({
  zip: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  object: z.string().nullable(),
  country: z.string().nullable(),
})

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
}, z.date())
export type DateTimeSchema = z.infer<typeof dateSchema>

const parcelDetailSchema = z.object({
  object: z.string().nullable(),
  source: z.string().nullable(),
  status: z.string().nullable(),
  message: z.string().nullable(),
  datetime: z.string().nullable(),
  description: z.string().nullable(),
  carrier_code: z.string().nullable(),
  status_detail: z.string().nullable(),
  tracking_location: trackingLocationSchema,
})

const parcelDetailsSchema = z.array(parcelDetailSchema)

export const rawDataParcelDetailsSchema = parcelDetailsSchema

export type RawDataParcelDetail = z.infer<typeof parcelDetailSchema>
export type RawDataParcelDetails = z.infer<typeof parcelDetailsSchema>
