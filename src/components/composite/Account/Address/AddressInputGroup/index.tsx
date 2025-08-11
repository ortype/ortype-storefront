import type {
  TErrorComponent,
  TResourceError,
} from '@commercelayer/react-components'
import { AddressInput } from '@commercelayer/react-components/addresses/AddressInput'
import { Errors } from '@commercelayer/react-components/errors/Errors'
import type { Address } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Field } from '@/components/ui/field'
import { CountrySelect, StateSelect } from '@/commercelayer/components/ui/address'
import type { AddressFormFields } from '@/types/Account'
import { Container } from '@chakra-ui/react'

interface Props {
  type: string
  fieldName: `billing_address_${Extract<keyof Address, AddressFormFields>}`
  resource: TResourceError
  value?: string
  required?: boolean
}

export function AddressInputGroup({
  fieldName,
  resource,
  type,
  value,
  required,
}: Props): JSX.Element {
  const { t } = useTranslation()

  const messages: TErrorComponent['messages'] = [
    {
      code: 'VALIDATION_ERROR',
      resource: 'billing_address',
      field: fieldName,
      message: t('input.mustBeValidFormat'),
    },
    {
      code: 'EMPTY_ERROR',
      resource: 'billing_address',
      field: fieldName,
      message: t('input.cantBlank'),
    },
  ]

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
        <>
          <CountrySelect
            label={label}
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
            placeholder={t(
              'addresses.addressForm.billing_address_country_code_placeholder'
            ) || 'Select Country'}
            disabled={Boolean(
              shippingCountryCodeLock &&
                fieldName === 'billing_address_country_code'
            )}
          />
        </>
      )
    } else if (isState) {
      return (
        <>
          <StateSelect
            label={label}
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
        </>
      )
    } else {
      return (
        <>
          <Field label={label}>
            <AddressInput
              id={fieldName}
              data-cy={`input_${fieldName}`}
              name={fieldName}
              type={type}
              value={valueStatus}
              required={required}
              className="form-input block w-full border-gray-300 border rounded-md p-3 transition duration-500 ease-in-out focus:border-black focus:ring focus:ring-offset-0 focus:ring-gray-400 focus:ring-opacity-50 sm:text-sm"
            />
          </Field>
        </>
      )
    }
  }

  return (
    <>
      {renderInput()}
      <Errors
        className={
          'inline-block text-xs pt-3 pl-3 border-red-400 text-red-400 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
        }
        data-cy={`error_${fieldName}`}
        resource={resource}
        field={fieldName}
        messages={messages}
      />
    </>
  )
}
