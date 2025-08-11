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
- **Purpose**: Async country selector from CommerceLayer countries endpoint
- **Features**:
  - Caches countries list to avoid repeated API calls
  - Uses CommerceLayer SDK for data fetching
  - Handles loading and error states
  - Sorts countries alphabetically by code
  - Integrates with Identity Provider for API access
  - Forwards refs for form integration

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

### 1. Caching Strategy
- Countries are cached in memory after first API call
- Cache persists across component unmounts/remounts
- Failed requests don't cache, allowing for retries
- Uses singleton pattern with module-level variables

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

### 4. API Integration
- Uses existing CommerceLayer SDK patterns
- Integrates with Identity Provider for authentication
- Follows existing error handling patterns
- Compatible with existing Commerce Layer infrastructure

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
import { AddressField, CountrySelect, StateSelect } from '@/commercelayer/components/ui/address'

function AddressForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    countryCode: '',
    stateCode: ''
  })

  return (
    <form>
      <AddressField
        label="First Name"
        value={formData.firstName}
        onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
      />
      
      <CountrySelect
        value={formData.countryCode}
        onChange={(countryCode) => setFormData(prev => ({ ...prev, countryCode }))}
      />
      
      <StateSelect
        value={formData.stateCode}
        onChange={(stateCode) => setFormData(prev => ({ ...prev, stateCode }))}
        countryCode={formData.countryCode}
      />
    </form>
  )
}
```

## Integration Notes

### Dependencies
- CommerceLayer SDK (`@commercelayer/sdk`)
- Identity Provider context
- Chakra UI components
- React Hook Form (optional, for form integration)

### Error Handling
- Network errors are caught and displayed
- API validation errors are handled gracefully  
- Loading states are managed automatically
- Client-side validation follows Commerce Layer patterns

### Performance Considerations
- Countries list is cached to minimize API calls
- State data is bundled (no additional API calls)
- Components are optimized for re-renders
- Lazy loading ready if needed

## Compliance with Requirements

✅ **URL Management**: Does not use `ProductContext`, follows `useUpdateURL` pattern where needed  
✅ **Form Integration**: All components forward refs and support form libraries  
✅ **Error Display**: Built-in error handling with consistent UI  
✅ **Atomic Design**: Each component serves a single, focused purpose  
✅ **CommerceLayer Integration**: Uses SDK and follows existing patterns  
✅ **Caching**: Countries endpoint results are cached efficiently  
✅ **TypeScript**: Full type safety with proper interfaces

## Future Enhancements

- Additional country state data (Brazil, India, Mexico)
- Async state loading from CommerceLayer API
- Internationalization support
- Custom validation rules
- Enhanced accessibility features
