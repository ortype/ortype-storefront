# SaveBillingAddressButton

A custom React component that handles saving billing addresses with client-side validation, error handling, and integration with the AddressProvider and CheckoutProvider.

## Features

- **Client-side validation** - Validates required fields and common formats (email, phone, zip code)
- **Error display** - Shows validation errors through AddressProvider
- **Loading states** - Provides loading/disabled UX identical to SaveAddressesButton
- **Global state refresh** - Calls `checkoutCtx.setAddresses()` to refresh checkout state after successful save
- **SDK integration** - Uses AddressProvider's `saveBillingAddress` method for Commerce Layer SDK calls

## Usage

```tsx
import SaveBillingAddressButton from '@/components/ui/SaveBillingAddressButton'
import { AddressProvider } from '@/commercelayer/providers/AddressProvider'
import { CheckoutProvider } from '@/commercelayer/providers/checkout'

function BillingAddressForm() {
  return (
    <CheckoutProvider orderId={orderId} config={config}>
      <AddressProvider>
        {/* Your form inputs here */}
        
        <SaveBillingAddressButton
          label="Save Billing Address"
          orderId={orderId}
          useAsShipping={false}
          onClick={() => {
            console.log('Address saved successfully!')
            // Optional: navigate or show success message
          }}
        />
      </AddressProvider>
    </CheckoutProvider>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Button text to display |
| `data-test-id` | `string` | `'save-billing-address'` | Test ID for testing purposes |
| `onClick` | `() => void` | - | Optional callback executed after successful save |
| `addressId` | `string` | - | Optional address ID for updating existing addresses |
| `orderId` | `string` | - | Optional order ID to attach address to an order |
| `useAsShipping` | `boolean` | `false` | Whether to also use this address as shipping address |

## Required Context Providers

The component must be wrapped with the following providers:

1. **AddressProvider** - Manages billing address state and provides save functionality
2. **CheckoutProvider** - Provides checkout context and `setAddresses` method

## Validation

The component performs client-side validation on the following fields:

### Required Fields
- `first_name`
- `last_name`
- `line_1`
- `city`
- `country_code`
- `state_code`
- `zip_code`
- `phone`

### Format Validation
- **Email** - Must match email format (if provided)
- **Phone** - Must be 6-20 characters with digits, spaces, hyphens, or parentheses
- **Zip Code** - Must be 3-10 characters with alphanumeric characters, spaces, or hyphens

## Error Handling

Validation errors are displayed through the AddressProvider's error state. Make sure your form inputs are connected to display these errors using the `Errors` component from Commerce Layer:

```tsx
import { Errors } from '@commercelayer/react-components/errors/Errors'

<Errors
  data-testid="error_billing_address_first_name"
  resource="billing_address"
  field="billing_address_first_name"
  messages={[
    {
      code: 'EMPTY_ERROR',
      resource: 'billing_address',
      field: 'billing_address_first_name',
      message: 'This field is required',
    },
  ]}
/>
```

## Flow

1. **Client-side validation** - Validates required fields and formats
2. **Error display** - Shows errors in AddressProvider if validation fails
3. **Save address** - Calls `saveBillingAddress` from AddressProvider
4. **Refresh state** - Calls `checkoutCtx.setAddresses()` to update global checkout state
5. **Callback** - Executes optional `onClick` callback

## Loading States

The button shows loading state and is disabled when:
- AddressProvider `isLoading` is true (during API calls)
- Internal `isValidating` is true (during client-side validation)

The loading state matches the UX of the original `SaveAddressesButton` component.

## Integration with Forms

The component works with any billing address form that uses the AddressProvider. The form inputs should use the `updateBillingAddressData` method from AddressProvider to update the billing address state:

```tsx
import { useAddressActions } from '@/commercelayer/providers/AddressProvider'

function BillingAddressInput() {
  const { updateBillingAddressData } = useAddressActions()
  
  const handleChange = (e) => {
    updateBillingAddressData({ 
      [e.target.name]: e.target.value 
    })
  }
  
  return (
    <input 
      name="first_name"
      onChange={handleChange}
    />
  )
}
```
