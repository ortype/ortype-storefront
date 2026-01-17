import { FloatingLabelSelect } from '@/commercelayer/components/ui/floating-label-select'
import type { CountryOption } from '@/commercelayer/utils/country-utils'
import { getCountries } from '@/commercelayer/utils/country-utils'
import { forwardRef } from 'react'

interface CountrySelectProps {
  label?: string
  error?: string
  value?: string
  onChange?: (countryCode: string) => void
  placeholder?: string
  disabled?: boolean
  countries?: CountryOption[]
}

/**
 * CountrySelect - Synchronous country selector using predefined country list.
 * Component is fully synchronous with no loading states.
 */
export const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
  (
    {
      label = 'Country',
      error,
      value,
      onChange,
      placeholder,
      disabled,
      countries: propCountries,
    },
    ref
  ) => {
    const availableCountries = getCountries(propCountries)

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value
      onChange?.(selectedValue)
    }

    // Build items array (prepend placeholder if provided)
    const items: CountryOption[] = [
      ...(placeholder
        ? [{ value: '', label: placeholder, disabled: false }]
        : []),
      ...availableCountries,
    ]

    return (
      <FloatingLabelSelect
        ref={ref}
        label={label}
        error={error}
        items={items}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
      />
    )
  }
)

CountrySelect.displayName = 'CountrySelect'
