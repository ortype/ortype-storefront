# Address UI Components

This directory contains atomic UI components for building address forms in the CommerceLayer storefront.

## Components

### `AddressField`

A thin wrapper around the `<Input>` component with consistent error display.

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message to display
- `value?: string` - Current value
- `onChange?: (value: string) => void` - Change handler
- All standard HTML input attributes

**Usage:**
```tsx
import { AddressField } from '@/commercelayer/components/ui/address'

<AddressField
  label="First Name"
  value={firstName}
  onChange={setFirstName}
  error={errors.firstName}
  required
/>
```

### `CountrySelect`

Synchronous country selector using predefined country list.

**Props:**
- `label?: string` - Field label (defaults to "Country")
- `error?: string` - Error message to display
- `value?: string` - Selected country code (ISO 2-letter)
- `onChange?: (countryCode: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Whether the select is disabled
- `countries?: CountryOption[]` - Optional custom country list

**Features:**
- Uses predefined country list for fast loading
- Automatically sorts countries alphabetically
- No loading states or API calls required
- Fully synchronous with no network dependencies

**Usage:**
```tsx
import { CountrySelect } from '@/commercelayer/components/ui/address'

<CountrySelect
  label="Country"
  value={countryCode}
  onChange={setCountryCode}
  error={errors.countryCode}
  placeholder="Select a country"
/>
```

### `StateSelect`

State/province selector that adapts based on the selected country.

**Props:**
- `label?: string` - Field label (defaults to "State/Province")
- `error?: string` - Error message to display
- `value?: string` - Selected state/province code
- `onChange?: (stateCode: string) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Whether the select is disabled
- `countryCode?: string` - Currently selected country code

**Features:**
- Shows dropdown for countries with predefined states (US, CA, AU)
- Falls back to text input for other countries
- Updates automatically when country changes
- Includes common states for supported countries

**Usage:**
```tsx
import { StateSelect } from '@/commercelayer/components/ui/address'

<StateSelect
  label="State"
  value={stateCode}
  onChange={setStateCode}
  countryCode={countryCode}
  error={errors.stateCode}
/>
```

## Form Integration

All components support React Hook Form integration through forwarded refs:

```tsx
import { useForm } from 'react-hook-form'
import { AddressField, CountrySelect, StateSelect } from '@/commercelayer/components/ui/address'

interface AddressFormData {
  firstName: string
  lastName: string
  countryCode: string
  stateCode: string
}

function AddressForm() {
  const { register, watch, formState: { errors } } = useForm<AddressFormData>()
  const countryCode = watch('countryCode')

  return (
    <form>
      <AddressField
        {...register('firstName', { required: 'First name is required' })}
        label="First Name"
        error={errors.firstName?.message}
      />
      
      <CountrySelect
        {...register('countryCode', { required: 'Country is required' })}
        label="Country"
        error={errors.countryCode?.message}
      />
      
      <StateSelect
        {...register('stateCode')}
        label="State/Province"
        countryCode={countryCode}
        error={errors.stateCode?.message}
      />
    </form>
  )
}
```

## Dependencies

These components require:
- Chakra UI components
- React Hook Form (optional, for form integration)
- Country utilities (`@/commercelayer/utils/country-utils`)

## Performance

The `CountrySelect` component is fully synchronous:
- Uses predefined country list for instant loading
- No network requests or loading states
- Optimal performance with minimal dependencies
