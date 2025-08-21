import { useState } from 'react'
import { AddressField, CountrySelect, StateSelect } from './index'
import { Box, Button, VStack } from '@chakra-ui/react'

interface AddressFormData {
  firstName: string
  lastName: string
  line1: string
  line2: string
  city: string
  countryCode: string
  stateCode: string
  zipCode: string
  phone: string
  email: string
}

/**
 * Example usage of address UI components
 * This demonstrates how to use the components together in a form
 */
export function AddressFormExample() {
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    countryCode: '',
    stateCode: '',
    zipCode: '',
    phone: '',
    email: '',
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({})

  const updateField = (field: keyof AddressFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {}

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.line1) newErrors.line1 = 'Address line 1 is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.countryCode) newErrors.countryCode = 'Country is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP/Postal code is required'

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log('Form submitted:', formData)
      alert('Address form submitted successfully! Check console for data.')
    }
  }

  return (
    <Box maxW="md" mx="auto" p={6}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <AddressField
            label="First Name"
            value={formData.firstName}
            onChange={updateField('firstName')}
            error={errors.firstName}
            required
          />

          <AddressField
            label="Last Name"
            value={formData.lastName}
            onChange={updateField('lastName')}
            error={errors.lastName}
            required
          />

          <AddressField
            label="Address Line 1"
            value={formData.line1}
            onChange={updateField('line1')}
            error={errors.line1}
            placeholder="Street address"
            required
          />

          <AddressField
            label="Address Line 2"
            value={formData.line2}
            onChange={updateField('line2')}
            error={errors.line2}
            placeholder="Apartment, suite, etc. (optional)"
          />

          <AddressField
            label="City"
            value={formData.city}
            onChange={updateField('city')}
            error={errors.city}
            required
          />

          <CountrySelect
            label="Country"
            value={formData.countryCode}
            onChange={updateField('countryCode')}
            error={errors.countryCode}
            placeholder="Select a country"
          />

          <StateSelect
            label="State/Province"
            value={formData.stateCode}
            onChange={updateField('stateCode')}
            countryCode={formData.countryCode}
            error={errors.stateCode}
            placeholder="Select state/province"
          />

          <AddressField
            label="ZIP/Postal Code"
            value={formData.zipCode}
            onChange={updateField('zipCode')}
            error={errors.zipCode}
            required
          />

          <AddressField
            label="Phone Number"
            value={formData.phone}
            onChange={updateField('phone')}
            error={errors.phone}
            type="tel"
            placeholder="(optional)"
          />

          <AddressField
            label="Email Address"
            value={formData.email}
            onChange={updateField('email')}
            error={errors.email}
            type="email"
            placeholder="(optional)"
          />

          <Button type="submit" colorScheme="blue" size="lg">
            Submit Address
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
