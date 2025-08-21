# Address UI Components Implementation

## Overview

This implementation provides three atomic UI components for building address forms in the CommerceLayer storefront:

## Components Built

### 1. AddressField (`AddressField.tsx`)

- **Purpose**: Thin wrapper around `<Input>` with consistent error display
- **Features**:
  - Forwards refs for form library integration
  - Built-in error state management
  - Consistent styling with Chakra UI
  - TypeScript support with proper typing

### 2. CountrySelect (`CountrySelect.tsx`)

- **Purpose**: Synchronous country selector using predefined country list
- **Features**:
  - Uses predefined country list for instant loading
  - No API calls or loading states required
  - Sorts countries alphabetically by name
  - Fully synchronous with minimal dependencies
  - Forwards refs for form integration
  - Supports custom country lists via props

### 3. StateSelect (`StateSelect.tsx`)

- **Purpose**: State/province selector that depends on selected country
- **Features**:
  - Adapts based on country selection
  - Dropdown for countries with predefined states (US, CA, AU)
  - Text input fallback for other countries
  - Includes comprehensive state data for supported countries
  - Updates automatically when country changes
  - Forwards refs for form integration

## Key Implementation Decisions

### 1. Data Strategy

- Countries use predefined list from utility functions for instant loading
- No API calls required for country selection
- Fully synchronous operation with no network dependencies
- Country list is maintained in `@/commercelayer/utils/country-utils`

### 2. State Management Approach

- Countries with predefined states use dropdown
- Other countries fall back to text input
- State data is hardcoded for performance and reliability
- Supports US (50 states + DC), Canada (provinces/territories), Australia (states/territories)

### 3. Form Integration

- All components use `forwardRef` for React Hook Form compatibility
- Consistent props interface: `value`, `onChange`, `error`
- Error state handling built into each component
- TypeScript interfaces for proper type safety

### 4. Dependency Management

- Minimal external dependencies for CountrySelect
- Uses utility functions for country data
- No network dependencies or API integration
- Compatible with existing Commerce Layer form patterns

## Files Structure

```
src/commercelayer/components/ui/address/
├── AddressField.tsx        # Generic address field component
├── CountrySelect.tsx       # Country selector with CommerceLayer API
├── StateSelect.tsx         # State/province selector
├── index.ts               # Main exports
├── Example.tsx            # Usage example
├── README.md              # User documentation
└── IMPLEMENTATION.md      # This file
```

## Usage Example

```tsx
import {
  AddressField,
  CountrySelect,
  StateSelect,
} from '@/commercelayer/components/ui/address'

function AddressForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    countryCode: '',
    stateCode: '',
  })

  return (
    <form>
      <AddressField
        label="First Name"
        value={formData.firstName}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, firstName: value }))
        }
      />

      <CountrySelect
        value={formData.countryCode}
        onChange={(countryCode) =>
          setFormData((prev) => ({ ...prev, countryCode }))
        }
      />

      <StateSelect
        value={formData.stateCode}
        onChange={(stateCode) =>
          setFormData((prev) => ({ ...prev, stateCode }))
        }
        countryCode={formData.countryCode}
      />
    </form>
  )
}
```

## Integration Notes

### Dependencies

- Chakra UI components
- Country utilities (`@/commercelayer/utils/country-utils`)
- React Hook Form (optional, for form integration)
- Native Select components (`@/components/ui/native-select`)

### Error Handling

- Client-side validation follows Commerce Layer patterns
- Error state handling built into each component
- Form validation errors are displayed consistently
- TypeScript ensures type safety at compile time

### Performance Considerations

- CountrySelect uses predefined data for instant loading
- State data is bundled (no API calls)
- Components are optimized for re-renders
- No network dependencies or loading states

## Compliance with Requirements

✅ **Form Integration**: All components forward refs and support form libraries  
✅ **Error Display**: Built-in error handling with consistent UI  
✅ **Atomic Design**: Each component serves a single, focused purpose  
✅ **Performance**: Synchronous operations with no network dependencies  
✅ **Data Management**: Uses utility functions for country/state data  
✅ **TypeScript**: Full type safety with proper interfaces

## Future Enhancements

- Additional country state data (Brazil, India, Mexico)
- Async state loading from CommerceLayer API
- Internationalization support
- Custom validation rules
- Enhanced accessibility features
