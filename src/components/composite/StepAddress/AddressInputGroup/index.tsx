import AddressCountrySelector from '@commercelayer/react-components/addresses/AddressCountrySelector'
import AddressInput from '@commercelayer/react-components/addresses/AddressInput'
import AddressStateSelector from '@commercelayer/react-components/addresses/AddressStateSelector'
import { Errors } from '@commercelayer/react-components/errors/Errors'
import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ShippingToggleProps,
  evaluateShippingToggle,
} from '@/components/composite/StepAddress'
import { CheckoutContext } from '@/components/data/CheckoutProvider'
import { Field } from '@/components/ui/field'
import { Box } from '@chakra-ui/react'

type TFieldName =
  | Parameters<typeof AddressCountrySelector>[0]['name']
  | Parameters<typeof AddressInput>[0]['name']
  | Parameters<typeof AddressStateSelector>[0]['name']

type TInputType = JSX.IntrinsicElements['input']['type']
type TResource = Parameters<typeof Errors>[0]['resource']
type TMessages = Parameters<typeof Errors>[0]['messages']

interface Props {
  type: TInputType
  fieldName: TFieldName
  resource: TResource
  required?: boolean
  value?: string
  openShippingAddress?: (props: ShippingToggleProps) => void
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

  const messages: TMessages = [
    {
      code: 'VALIDATION_ERROR',
      resource: 'billing_address',
      field: fieldName,
      message: t('input.mustBeValidFormat'),
    },
    {
      code: 'VALIDATION_ERROR',
      resource: 'shipping_address',
      field: fieldName,
      message: t('input.mustBeValidFormat'),
    },
    {
      code: 'EMPTY_ERROR',
      resource: 'billing_address',
      field: fieldName,
      message: t('input.cantBlank'),
    },
    {
      code: 'EMPTY_ERROR',
      resource: 'shipping_address',
      field: fieldName,
      message: t('input.cantBlank'),
    },
  ]

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

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (isCountry && fieldName === 'billing_address_country_code') {
      const countryCode = event.target.value

      openShippingAddress &&
        openShippingAddress(
          evaluateShippingToggle({ countryCode, shippingCountryCodeLock })
        )
    }
  }

  function renderInput() {
    if (isCountry) {
      return (
        <>
          <Field label={label}>
            <AddressCountrySelector
              id={fieldName}
              className="form-select"
              data-testid={`input_${fieldName}`}
              name={fieldName}
              placeholder={{
                label: t(`addressForm.${fieldName}_placeholder`),
                value: '',
              }}
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
            />
          </Field>
        </>
      )
    } else if (isState) {
      return (
        <>
          <Field label={label}>
            <AddressStateSelector
              id={fieldName}
              selectClassName="form-select"
              inputClassName="form-input"
              data-testid={`input_${fieldName}`}
              name={fieldName}
              value={value}
            />
          </Field>
        </>
      )
    } else {
      return (
        <>
          <Field label={label}>
            <AddressInput
              id={fieldName}
              required={required}
              data-testid={`input_${fieldName}`}
              name={fieldName}
              type={type}
              value={valueStatus}
              className="form-input"
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
      <Errors
        data-testid={`error_${fieldName}`}
        resource={resource}
        field={fieldName}
        messages={messages}
      />
    </div>
  )
}
