import { Field } from '@/components/ui/field'
import {
  NativeSelectField,
  NativeSelectRoot,
} from '@/components/ui/native-select'
import { getCountries } from '@/commercelayer/utils/country-utils'
import type { CountryOption } from '@/commercelayer/utils/country-utils'
// Note: Using a simple text fallback instead of ChevronDownIcon from @chakra-ui/icons
// to avoid dependency issues. The NativeSelectField should have its own dropdown arrow styling.
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
      <Field label={label} errorText={error} invalid={!!error}>
        <NativeSelectRoot disabled={disabled}>
          <NativeSelectField
            ref={ref}
            items={items}
            value={value || ''}
            onChange={handleChange}
            // icon prop removed - NativeSelectField should handle dropdown styling
          />
        </NativeSelectRoot>
      </Field>
    )
  }
)

CountrySelect.displayName = 'CountrySelect'
