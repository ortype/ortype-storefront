import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ShippingToggleProps,
  evaluateShippingToggle,
} from '@/commercelayer/components/pages/checkout/step-address'
import { AddressField } from '@/commercelayer/components/ui/address/address-field'
import { CountrySelect } from '@/commercelayer/components/ui/address/country-select'
import { StateSelect } from '@/commercelayer/components/ui/address/state-select'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

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
  onChange?: (fieldName: string, value: string) => void
  /** Current country from the parent form, used to choose state/province options. */
  countryCode?: string
  variant?: string
}

// Mapping object to determine which component to use for each field
const FIELD_COMPONENT_MAPPING = {
  // Country fields -> CountrySelect
  shipping_address_country_code: 'CountrySelect',
  billing_address_country_code: 'CountrySelect',
  // State fields -> StateSelect
  shipping_address_state_code: 'StateSelect',
  billing_address_state_code: 'StateSelect',
  // All other fields -> AddressField
} as const

type ComponentType = 'AddressField' | 'CountrySelect' | 'StateSelect'
/**
 * Field-routing adapter for billing/shipping address forms, not a replacement
 * for AddressField: country fields use CountrySelect, state fields use
 * StateSelect, and other fields use AddressField, with translated labels.
 *
 * Keeps a local input value in sync with value and reports changes as
 * onChange(fieldName, value); the parent owns persistence and must pass its
 * current countryCode to state fields. Also applies checkout shipping-country
 * locks and optionally reevaluates the shipping toggle on billing-country changes.
 * Independent RHF forms can use the primitives directly, with StateSelect standalone.
 */

export const AddressInputGroup: React.FC<Props> = ({
  fieldName,
  resource,
  required,
  type,
  value,
  openShippingAddress,
  onChange,
  countryCode,
  variant = 'subtle',
}) => {
  const { t } = useTranslation()
  const checkoutCtx = useContext(CheckoutContext)

  let shippingCountryCodeLock: string | undefined = ''
  if (checkoutCtx) {
    shippingCountryCodeLock = checkoutCtx.shippingCountryCodeLock
  }

  // Look up the component type from the mapping
  const componentType: ComponentType =
    FIELD_COMPONENT_MAPPING[
      fieldName as keyof typeof FIELD_COMPONENT_MAPPING
    ] || 'AddressField'

  // Common props shared by all components
  const commonProps = {
    id: fieldName,
    'data-testid': `input_${fieldName}`,
    label: t(`addressForm.${fieldName}`),
    value: value || '',
    required,
    variant,
  }

  // Handle change events and state updates
  const [valueStatus, setValueStatus] = useState(value || '')

  useEffect(() => {
    setValueStatus(value || '')
  }, [value])

  // Bridge primitive value callbacks to the parent's field-name/value handler.
  const handleChange = useCallback(
    (newValue: string) => {
      // 1. Update local controlled input state
      setValueStatus(newValue)

      // 2. Call parent onChange handler if provided
      if (onChange) {
        onChange(fieldName, newValue)
      }

      // 3. Additional logic for billing_address_country_code
      if (
        fieldName === 'billing_address_country_code' &&
        openShippingAddress
      ) {
        openShippingAddress(
          evaluateShippingToggle({
            countryCode: newValue,
            shippingCountryCodeLock,
          })
        )
      }

      return newValue
    },
    [fieldName, onChange, openShippingAddress, shippingCountryCodeLock]
  )

  // Component-specific handlers that use the common handleChange
  const handleAddressFieldChange = useCallback(
    (newValue: string) => {
      return handleChange(newValue)
    },
    [handleChange]
  )

  const handleCountryChange = useCallback(
    (countryCode: string) => {
      return handleChange(countryCode)
    },
    [handleChange]
  )

  const handleStateChange = useCallback(
    (stateCode: string) => {
      return handleChange(stateCode)
    },
    [handleChange]
  )

  // Render the chosen component with delegated props
  const renderComponent = () => {
    switch (componentType) {
      case 'CountrySelect':
        return (
          <CountrySelect
            {...commonProps}
            value={
              shippingCountryCodeLock &&
              fieldName === 'shipping_address_country_code'
                ? shippingCountryCodeLock
                : valueStatus
            }
            onChange={handleCountryChange}
            placeholder={
              t(`addressForm.${fieldName}_placeholder`) || 'Select Country'
            }
            disabled={Boolean(
              shippingCountryCodeLock &&
              fieldName === 'shipping_address_country_code'
            )}
          />
        )

      case 'StateSelect':
        return (
          <StateSelect
            {...commonProps}
            value={valueStatus}
            onChange={handleStateChange}
            placeholder='Select State/Province'
            name={
              fieldName as
                'billing_address_state_code' | 'shipping_address_state_code'
            }
            countryCode={countryCode}
          />
        )

      default:
        return (
          <AddressField
            {...commonProps}
            value={valueStatus}
            onChange={handleAddressFieldChange}
            type={type}
          />
        )
    }
  }

  return renderComponent()
}
