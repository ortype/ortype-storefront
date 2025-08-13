import { useAddressActions, useAddressState, AddressErrors } from '@/commercelayer/providers/address'
import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import { Button, Text } from '@chakra-ui/react'
import { useState } from 'react'

interface SaveBillingAddressButtonProps {
  label: string
  'data-test-id'?: string
  onClick?: () => void
  addressId?: string
  orderId?: string
  useAsShipping?: boolean
}

export function SaveBillingAddressButton({
  label,
  'data-test-id': dataTestId = 'save-billing-address',
  onClick,
  addressId,
  orderId,
  useAsShipping = false,
}: SaveBillingAddressButtonProps): JSX.Element | null {
  const [isValidating, setIsValidating] = useState(false)
  const { billing, isLoading, errors } = useAddressState()
  const { saveBillingAddress, setErrors, clearErrors } = useAddressActions()
  const checkoutCtx = useCheckoutContext()

  // Required fields for validation
  const requiredFields = [
    'first_name',
    'last_name',
    'line_1',
    'city',
    'country_code',
    'state_code',
    'zip_code',
    'phone',
  ]

  const handleClick = async () => {
    setIsValidating(true)
    clearErrors()
    
    // Client-side validation
    const validationErrors: Record<string, string[]> = {}
    let hasErrors = false

    // Check required fields
    requiredFields.forEach(field => {
      if (!billing[field as keyof typeof billing] || String(billing[field as keyof typeof billing]).trim() === '') {
        validationErrors[field] = validationErrors[field] || []
        validationErrors[field].push('This field is required')
        hasErrors = true
      }
    })
    
    // Simple format validation
    // Email format (if present)
    if (billing.email && !/^\S+@\S+\.\S+$/.test(billing.email)) {
      validationErrors.email = validationErrors.email || []
      validationErrors.email.push('Must be a valid email format')
      hasErrors = true
    }
    
    // Phone number format (basic validation)
    if (billing.phone && !/^[+]?[\d\s()-]{6,20}$/.test(billing.phone)) {
      validationErrors.phone = validationErrors.phone || []
      validationErrors.phone.push('Must be a valid phone number')
      hasErrors = true
    }
    
    // Zip code format (basic validation)
    if (billing.zip_code && !/^[\w\s-]{3,10}$/.test(billing.zip_code)) {
      validationErrors.zip_code = validationErrors.zip_code || []
      validationErrors.zip_code.push('Must be a valid zip/postal code')
      hasErrors = true
    }

    if (hasErrors) {
      // Show validation errors via AddressProvider
      setErrors(validationErrors)
      setIsValidating(false)
      return
    }

    try {
      // Call save billing address method from provider
      const result = await saveBillingAddress({
        addressData: billing,
        orderId,
        useAsShipping
      })

      if (result.success && checkoutCtx) {
        // Pass the updated order from the result to avoid refetching stale data
        if (result.order) {
          await checkoutCtx.setAddresses(result.order)
        } else {
          // Fallback to refetching if no order in result
          await checkoutCtx.setAddresses()
        }
      }

      if (onClick) {
        onClick()
      }
    } catch (error) {
      console.error('Error saving billing address:', error)
    } finally {
      setIsValidating(false)
    }
  }

  // Combined loading state to disable the button
  const isButtonDisabled = isLoading || isValidating

  return (
    <Button
      data-test-id={dataTestId}
      onClick={handleClick}
      loading={isButtonDisabled}
      disabled={isButtonDisabled}
      variant="solid"
      colorScheme="blue"
      ml={4}
    >
      <Text>{isButtonDisabled ? 'Saving...' : label}</Text>
    </Button>
  )
}

export default SaveBillingAddressButton
