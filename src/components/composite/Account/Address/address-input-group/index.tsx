import type { Address } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  AddressField,
  CountrySelect,
  StateSelect,
} from '@/commercelayer/components/ui/address'
import type { AddressFormFields } from '@/types/Account'

interface Props {
  type: string
  fieldName: `billing_address_${Extract<keyof Address, AddressFormFields>}`
  value?: string
  required?: boolean
  error?: string
}

export function AddressInputGroup({
  fieldName,
  type,
  value,
  required,
  error,
}: Props): JSX.Element {
  const { t } = useTranslation()

  const label = t(`addresses.addressForm.fields.${fieldName}`)

  const [valueStatus, setValueStatus] = useState(value)

  const isCountry = fieldName === 'billing_address_country_code'

  const isState = fieldName === 'billing_address_state_code'

  const shippingCountryCodeLock = ''

  useEffect(() => {
    setValueStatus(value || '')
  }, [value])

  function renderInput() {
    if (isCountry) {
      return (
        <CountrySelect
          label={label}
          error={error}
          value={
            shippingCountryCodeLock &&
            fieldName === 'billing_address_country_code'
              ? shippingCountryCodeLock
              : value || ''
          }
          onChange={(countryCode) => {
            // Handle country change - this would typically update parent form state
            console.log('Country changed:', countryCode)
          }}
          placeholder={
            t(
              'addresses.addressForm.billing_address_country_code_placeholder'
            ) || 'Select Country'
          }
          disabled={Boolean(
            shippingCountryCodeLock &&
              fieldName === 'billing_address_country_code'
          )}
        />
      )
    } else if (isState) {
      return (
        <StateSelect
          label={label}
          error={error}
          value={value || ''}
          onChange={(stateCode) => {
            // Handle state change - this would typically update parent form state
            console.log('State changed:', stateCode)
          }}
          name={fieldName as any}
          placeholder="Select State/Province"
          selectClassName="form-select"
          inputClassName="form-input block w-full border-gray-300 border rounded-md p-3 transition duration-500 ease-in-out focus:border-black focus:ring focus:ring-offset-0 focus:ring-gray-400 focus:ring-opacity-50 sm:text-sm"
        />
      )
    } else {
      return (
        <AddressField
          label={label}
          error={error}
          id={fieldName}
          data-cy={`input_${fieldName}`}
          name={fieldName}
          type={type}
          value={valueStatus}
          required={required}
          className="form-input block w-full border-gray-300 border rounded-md p-3 transition duration-500 ease-in-out focus:border-black focus:ring focus:ring-offset-0 focus:ring-gray-400 focus:ring-opacity-50 sm:text-sm"
          onChange={(newValue) => {
            setValueStatus(newValue)
          }}
        />
      )
    }
  }

  return renderInput()
}
