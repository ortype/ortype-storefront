import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ShippingToggleProps,
  evaluateShippingToggle,
} from '@/commercelayer/components/pages/checkout/step-address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Field } from '@/components/ui/field'
import { Box, Input } from '@chakra-ui/react'
import { NativeSelectRoot, NativeSelectField } from '@/components/ui/native-select'

type TFieldName = string

type TInputType = JSX.IntrinsicElements['input']['type']
type TResource = 'billing_address' | 'shipping_address'

interface Props {
  type: TInputType
  fieldName: TFieldName
  resource: TResource
  required?: boolean
  value?: string
  openShippingAddress?: (props: ShippingToggleProps) => void
}

// Simple error display component
const ErrorDisplay = ({ message }: { message?: string }) => {
  if (!message) return null
  return <div className="text-red-500 text-sm mt-1">{message}</div>
}

export const AddressInputGroup: React.FC<Props> = ({
  fieldName,
  resource,
  required,
  type,
  value,
  openShippingAddress,
}) => {
  const { t } = useTranslation()

  const checkoutCtx = useContext(CheckoutContext)

  let shippingCountryCodeLock: string | undefined = ''

  if (checkoutCtx) {
    shippingCountryCodeLock = checkoutCtx.shippingCountryCodeLock
  }

  const label = t(`addressForm.${fieldName}`)

  const [valueStatus, setValueStatus] = useState(value)

  const isCountry =
    fieldName === 'shipping_address_country_code' ||
    fieldName === 'billing_address_country_code'

  const isState =
    fieldName === 'shipping_address_state_code' ||
    fieldName === 'billing_address_state_code'

  useEffect(() => {
    setValueStatus(value || '')
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const newValue = event.target.value
    setValueStatus(newValue)
    
    if (isCountry && fieldName === 'billing_address_country_code') {
      const countryCode = newValue

      openShippingAddress &&
        openShippingAddress(
          evaluateShippingToggle({ countryCode, shippingCountryCodeLock })
        )
    }
  }

  // Basic country options - in a real app you'd get this from a service
  const countryOptions = [
    { value: '', label: t(`addressForm.${fieldName}_placeholder`) || 'Select Country' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    // Add more countries as needed
  ]

  // Basic state options - in a real app you'd get this based on selected country
  const stateOptions = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'CA', label: 'California' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    // Add more states as needed
  ]

  function renderInput() {
    if (isCountry) {
      return (
        <>
          <Field label={label}>
            <NativeSelectRoot variant="subtle">
              <NativeSelectField
                id={fieldName}
                data-testid={`input_${fieldName}`}
                name={fieldName}
                onChange={handleChange}
                value={
                  shippingCountryCodeLock &&
                  fieldName === 'shipping_address_country_code'
                    ? shippingCountryCodeLock
                    : value
                }
                disabled={Boolean(
                  shippingCountryCodeLock &&
                    fieldName === 'shipping_address_country_code'
                )}
                items={countryOptions}
              />
            </NativeSelectRoot>
          </Field>
        </>
      )
    } else if (isState) {
      return (
        <>
          <Field label={label}>
            <NativeSelectRoot variant="subtle">
              <NativeSelectField
                id={fieldName}
                data-testid={`input_${fieldName}`}
                name={fieldName}
                value={value}
                onChange={handleChange}
                items={stateOptions}
              />
            </NativeSelectRoot>
          </Field>
        </>
      )
    } else {
      return (
        <>
          <Field label={label}>
            <Input
              id={fieldName}
              required={required}
              data-testid={`input_${fieldName}`}
              name={fieldName}
              type={type}
              value={valueStatus}
              onChange={handleChange}
              variant="subtle"
            />
          </Field>
        </>
      )
    }
  }

  return (
    <div className="mb-8">
      <Box>
        <div className="relative h-10">{renderInput()}</div>
      </Box>
      <ErrorDisplay message={undefined} />
    </div>
  )
}
