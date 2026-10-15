import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { FloatingLabelSelect } from '@/commercelayer/components/ui/floating-label-select'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import {
  getStateOfCountry,
  isValidState,
  type StateOption,
  type States,
} from '@/commercelayer/utils/country-utils'
import { forwardRef, useContext, useEffect, useMemo, useState } from 'react'

// Optional imports - handle gracefully if providers aren't available
let useAddressState: any = null
let useAddressActions: any = null

try {
  const addressModule = require('@/commercelayer/providers/address')
  useAddressState = addressModule.useAddressState
  useAddressActions = addressModule.useAddressActions
} catch {
  // Address providers not available - this is OK
}

type AddressStateSelectName =
  'billing_address_state_code' | 'shipping_address_state_code'

interface StateSelectProps {
  label?: string
  error?: string
  value?: string
  onChange?: (stateCode: string) => void
  onBlur?: React.FocusEventHandler<HTMLSelectElement | HTMLInputElement>
  placeholder?: string
  disabled?: boolean
  countryCode?: string
  /**
   * Use only countryCode and onChange, without billing-country fallbacks or
   * billing-address writes. Useful for independent forms such as license owners.
   */
  standalone?: boolean
  name?: AddressStateSelectName
  required?: boolean
  /**
   * Optional class name for the input field.
   */
  inputClassName?: string
  /**
   * Optional placeholder for the input field.
   */
  inputPlaceholder?: string
  /**
   * Optional class name for the select field.
   */
  selectClassName?: string
  /**
   * Optional placeholder for the select field.
   */
  selectPlaceholder?: { value: string; label: string }
  /**
   * Optional states list to extend the default one.
   */
  states?: States

  variant?: string
}

/**
 * StateSelect - State/province selector that integrates with address context.
 * Automatically detects the country from billing/shipping address context
 * and renders appropriate states. Falls back to text input for countries
 * without predefined states.
 * Set standalone for forms that own their country/state independently of checkout.
 *
 * Similar to Commerce Layer's AddressStateSelector component.
 */
export const StateSelect = forwardRef<
  HTMLSelectElement | HTMLInputElement,
  StateSelectProps
>(
  (
    {
      label = 'State/Province',
      error,
      value,
      onChange,
      onBlur,
      placeholder,
      disabled,
      countryCode: propCountryCode,
      standalone = false,
      name = 'billing_address_state_code',
      required = false,
      inputClassName = '',
      inputPlaceholder,
      selectClassName = '',
      selectPlaceholder,
      states,
      variant,
    },
    ref
  ) => {
    const checkoutCtx = useContext(CheckoutContext)

    // Safely try to use address context if available
    let addressState = null
    let updateBillingAddressData = null

    try {
      if (useAddressState && useAddressActions) {
        addressState = useAddressState()
        const actions = useAddressActions()
        updateBillingAddressData = actions.updateBillingAddressData
      }
    } catch {
      // Address context not available - this is OK, we'll work without it
    }

    // An explicit empty country must remain empty, rather than restoring billing.
    const countryCode = standalone
      ? (propCountryCode ?? '')
      : (propCountryCode ??
        checkoutCtx?.billingAddress?.country_code ??
        addressState?.billing?.country_code ??
        '')

    const [localValue, setVal] = useState(value ?? '')
    // Controlled values (including empty resets) take precedence over local input.
    const val = value ?? localValue

    // Reset state when country changes and current state is invalid
    useEffect(() => {
      if (
        countryCode &&
        val &&
        !isValidState({
          stateCode: val,
          countryCode,
          states,
        })
      ) {
        const availableStates = getStateOfCountry({
          countryCode,
          states,
        })
        if (availableStates.length > 0) {
          setVal('')
          onChange?.('')
        }
      }
    }, [countryCode, val, states, onChange])

    const stateOptions = useMemo(() => {
      if (!countryCode) {
        return []
      }
      return getStateOfCountry({
        countryCode,
        states,
      })
    }, [countryCode, states])

    const isEmptyStates = useMemo(
      () => stateOptions.length === 0,
      [stateOptions]
    )

    const handleSelectChange = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const selectedValue = event.target.value
      setVal(selectedValue)
      onChange?.(selectedValue)

      // Update address context if available
      if (
        !standalone &&
        name === 'billing_address_state_code' &&
        updateBillingAddressData
      ) {
        updateBillingAddressData({
          state_code: selectedValue,
        })
      }
    }

    const handleInputChange = (inputValue: string) => {
      setVal(inputValue)
      onChange?.(inputValue)

      // Update address context if available
      if (
        !standalone &&
        name === 'billing_address_state_code' &&
        updateBillingAddressData
      ) {
        updateBillingAddressData({ state_code: inputValue })
      }
    }

    // If no states available, render text input
    if (isEmptyStates) {
      return (
        <FloatingLabelInput
          ref={ref as React.Ref<HTMLInputElement>}
          label={label}
          error={error}
          value={val}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={onBlur}
          placeholder={
            inputPlaceholder ||
            placeholder ||
            (countryCode ? `${label} (optional)` : placeholder)
          }
          disabled={disabled}
          required={required}
          type='text'
          variant={variant}
          size='lg'
          fontSize='md'
          borderRadius={0}
          className={inputClassName}
        />
      )
    }

    // Prepare items for NativeSelectField
    const items: StateOption[] = [
      ...(selectPlaceholder
        ? [selectPlaceholder]
        : placeholder
          ? [
              {
                value: '',
                label: placeholder,
                disabled: false,
              },
            ]
          : []),
      ...stateOptions,
    ]

    return (
      <FloatingLabelSelect
        ref={ref as React.Ref<HTMLSelectElement>}
        label={label}
        error={error}
        items={items}
        variant={variant}
        value={val}
        onChange={handleSelectChange}
        onBlur={onBlur}
        disabled={disabled}
        className={selectClassName}
        required={required}
        name={standalone ? undefined : name}
      />
    )
  }
)

StateSelect.displayName = 'StateSelect'
