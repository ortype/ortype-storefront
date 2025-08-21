import {
  type Address,
  type AddressCreate,
  type AddressUpdate,
  type CommerceLayerClient,
  type Order,
  type OrderUpdate,
} from '@commercelayer/sdk'

// Types for address operations
export interface AddressError {
  /**
   * Error message without attribute key
   * Example: "can't be blank"
   */
  title: string
  /**
   * Computed error message that includes attribute key
   * Example: "first_name - can't be blank"
   */
  detail: string
  /**
   * Error code
   * Example: "VALIDATION_ERROR"
   */
  code?: string
  /**
   * HTTP status code
   * Example: "422"
   */
  status?: string
  /**
   * Points where the error occurred
   * Only when code: 'VALIDATION_ERROR'
   * Example: {"pointer": "/data/attributes/first_name"}
   */
  source?: {
    pointer: string
  }
  meta?: unknown
}

export interface AddressErrorResponse {
  errors: AddressError[]
}

export interface AddressOperationResult<T = any> {
  success: boolean
  data?: T
  error?: AddressErrorResponse | unknown
}

export interface CreateBillingAddressParams {
  cl: CommerceLayerClient
  addressData: AddressCreate
}

export interface UpdateBillingAddressParams {
  cl: CommerceLayerClient
  addressId: string
  addressData: AddressUpdate
}

export interface SetOrderBillingAddressParams {
  cl: CommerceLayerClient
  orderId: string
  addressId: string
  /**
   * Whether to also use this address as shipping address
   */
  useAsShipping?: boolean
}

export interface ValidateAddressParams {
  addressData: Partial<AddressCreate>
}

/**
 * Creates a new billing address
 * Re-uses logic from providers/checkout/utils.ts where possible
 */
export const createBillingAddress = async ({
  cl,
  addressData,
}: CreateBillingAddressParams): Promise<AddressOperationResult<Address>> => {
  try {
    if (!cl) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing Commerce Layer client',
              detail: 'Commerce Layer client is required',
              code: 'MISSING_CLIENT',
            },
          ],
        },
      }
    }

    // Set reference to address ID for future lookups (pattern from existing utils)
    const addressToCreate: AddressCreate = {
      ...addressData,
    }

    const address = await cl.addresses.create(addressToCreate)

    // Update reference after creation to match existing pattern
    if (address.id && !address.reference) {
      await cl.addresses.update({
        id: address.id,
        reference: address.id,
      })
      address.reference = address.id
    }

    return {
      success: true,
      data: address,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

/**
 * Updates an existing billing address
 */
export const updateBillingAddress = async ({
  cl,
  addressId,
  addressData,
}: UpdateBillingAddressParams): Promise<AddressOperationResult<Address>> => {
  try {
    if (!cl) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing Commerce Layer client',
              detail: 'Commerce Layer client is required',
              code: 'MISSING_CLIENT',
            },
          ],
        },
      }
    }

    if (!addressId) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing address ID',
              detail: 'Address ID is required for updates',
              code: 'MISSING_ADDRESS_ID',
            },
          ],
        },
      }
    }

    const address = await cl.addresses.update({
      id: addressId,
      ...addressData,
    })

    return {
      success: true,
      data: address,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

/**
 * Attaches an address to an order as billing address (and optionally shipping)
 * Uses the _billing_address_clone_id pattern from existing utils
 */
export const setOrderBillingAddress = async ({
  cl,
  orderId,
  addressId,
  useAsShipping = false,
}: SetOrderBillingAddressParams): Promise<AddressOperationResult<Order>> => {
  try {
    if (!cl) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing Commerce Layer client',
              detail: 'Commerce Layer client is required',
              code: 'MISSING_CLIENT',
            },
          ],
        },
      }
    }

    if (!orderId) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing order ID',
              detail: 'Order ID is required',
              code: 'MISSING_ORDER_ID',
            },
          ],
        },
      }
    }

    if (!addressId) {
      return {
        success: false,
        error: {
          errors: [
            {
              title: 'Missing address ID',
              detail: 'Address ID is required',
              code: 'MISSING_ADDRESS_ID',
            },
          ],
        },
      }
    }

    // Build update object using the clone pattern from existing utils
    const updateObject: OrderUpdate = {
      id: orderId,
      _billing_address_clone_id: addressId,
    }

    // Also set as shipping address if requested
    if (useAsShipping) {
      updateObject._shipping_address_clone_id = addressId
    }

    const order = await cl.orders.update(updateObject, {
      include: ['billing_address', 'shipping_address'],
    })

    // Set localStorage flags to match existing pattern
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        '_save_billing_address_to_customer_address_book',
        'false'
      )
      if (useAsShipping) {
        localStorage.setItem(
          '_save_shipping_address_to_customer_address_book',
          'false'
        )
      }
    }

    return {
      success: true,
      data: order,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

/**
 * Validates address data before creating/updating
 * Returns structured validation errors that can be used by UI
 */
export const validateAddress = ({
  addressData,
}: ValidateAddressParams): AddressOperationResult<boolean> => {
  const errors: AddressError[] = []

  // Required field validation
  const requiredFields = [
    'first_name',
    'last_name',
    'line_1',
    'city',
    'country_code',
    'zip_code',
  ]

  requiredFields.forEach((field) => {
    const value = addressData[field as keyof typeof addressData]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        title: "can't be blank",
        detail: `${field} - can't be blank`,
        code: 'VALIDATION_ERROR',
        source: {
          pointer: `/data/attributes/${field}`,
        },
      })
    }
  })

  // Email validation (if provided)
  if (addressData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(addressData.email)) {
      errors.push({
        title: 'must be valid format',
        detail: 'email - must be valid format',
        code: 'VALIDATION_ERROR',
        source: {
          pointer: '/data/attributes/email',
        },
      })
    }
  }

  // Phone validation (if provided)
  if (addressData.phone) {
    // Basic phone validation - should contain digits and common phone chars
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(addressData.phone)) {
      errors.push({
        title: 'must be valid format',
        detail: 'phone - must be valid format',
        code: 'VALIDATION_ERROR',
        source: {
          pointer: '/data/attributes/phone',
        },
      })
    }
  }

  // Country code validation
  if (addressData.country_code && addressData.country_code.length !== 2) {
    errors.push({
      title: 'must be 2 characters',
      detail: 'country_code - must be 2 characters',
      code: 'VALIDATION_ERROR',
      source: {
        pointer: '/data/attributes/country_code',
      },
    })
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        errors,
      },
    }
  }

  return {
    success: true,
    data: true,
  }
}

/**
 * Helper function to check if an error is a Commerce Layer API error
 * Re-uses pattern from setApiFormErrors.ts
 */
export function isAddressApiError(error: any): error is AddressErrorResponse {
  try {
    const hasErrorsArray =
      'errors' in error &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    const errorsHaveApiErrorShape = (
      error as AddressErrorResponse
    ).errors.every((err) => 'title' in err && 'detail' in err)
    return hasErrorsArray && errorsHaveApiErrorShape
  } catch {
    return false
  }
}

/**
 * Helper to extract field name from error source pointer
 * Re-uses pattern from setApiFormErrors.ts
 */
export function getFieldFromError(error: AddressError): string | undefined {
  if (error.source?.pointer != null && error.source?.pointer !== '') {
    const field = error.source?.pointer.split('/').at(-1)
    return field
  }

  if (error.detail != null && error.detail !== '') {
    const field = error.detail.split(' - ').at(0)
    return field
  }
}

/**
 * Transforms Commerce Layer API errors into a format suitable for form display
 * Compatible with react-hook-form and existing error handling patterns
 */
export function transformAddressErrors(error: any): {
  fieldErrors: Array<{ field: string; message: string }>
  generalErrors: string[]
} {
  const fieldErrors: Array<{ field: string; message: string }> = []
  const generalErrors: string[] = []

  if (!isAddressApiError(error)) {
    generalErrors.push('Could not process your request')
    return { fieldErrors, generalErrors }
  }

  error.errors.forEach((err) => {
    const field = getFieldFromError(err)

    if (err.code === 'VALIDATION_ERROR' && field) {
      fieldErrors.push({
        field,
        message: err.title,
      })
    } else {
      generalErrors.push(err.detail)
    }
  })

  return { fieldErrors, generalErrors }
}
