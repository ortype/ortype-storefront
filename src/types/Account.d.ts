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

declare global {
  interface Window {
    /**
     * Commerce Layer app configuration available from global window object
     */
    clAppConfig: CommerceLayerAppConfig
  }

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
