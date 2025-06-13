import AddressCountrySelector from '@commercelayer/react-components/addresses/AddressCountrySelector'
import AddressInput from '@commercelayer/react-components/addresses/AddressInput'
import AddressStateSelector from '@commercelayer/react-components/addresses/AddressStateSelector'
import { Errors } from '@commercelayer/react-components/errors/Errors'
/*
import {
  Country,
  States,
} from "@commercelayer/react-components/lib/esm/utils/countryStateCity"
*/
import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ShippingToggleProps,
  evaluateShippingToggle,
} from '@/commercelayer/components/pages/checkout/step-address'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Field } from '@/components/ui/field'
import { Box, Input } from '@chakra-ui/react'

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

const ChakraStyledCLayerSelect = ({ children }) => {
  return (
    <Box
      asChild
      css={{
        // @NOTE: using styles copied from chakra native-select.ts
        width: '100%',
        minWidth: '0',
        outline: '0',
        appearance: 'none',
        borderRadius: 'l2',
        _disabled: {
          layerStyle: 'disabled',
        },
        _invalid: {
          borderColor: 'border.error',
        },
        focusVisibleRing: 'inside',
        lineHeight: 'normal',
        '& > option, & > optgroup': {
          bg: 'inherit',
        },
        borderWidth: '1px',
        borderColor: 'transparent',
        bg: 'bg.muted',
        textStyle: 'sm',
        ps: '3',
        pe: '8',
        height: '10',
      }}
    >
      {children}
    </Box>
  )
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
            <ChakraStyledCLayerSelect>
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
            </ChakraStyledCLayerSelect>
          </Field>
        </>
      )
    } else if (isState) {
      return (
        <>
          <Field label={label}>
            <ChakraStyledCLayerSelect>
              <AddressStateSelector
                id={fieldName}
                selectClassName="form-select"
                inputClassName="form-input"
                data-testid={`input_${fieldName}`}
                name={fieldName}
                value={value}
              />
            </ChakraStyledCLayerSelect>
          </Field>
        </>
      )
    } else {
      return (
        <>
          <Field label={label}>
            <Input asChild variant={'subtle'}>
              <AddressInput
                id={fieldName}
                required={required}
                data-testid={`input_${fieldName}`}
                name={fieldName}
                type={type}
                value={valueStatus}
                className="form-input"
              />
            </Input>
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
