# CheckoutProvider

The CheckoutProvider is a React context provider that manages the complete checkout flow state and operations for Commerce Layer orders. It serves as the central state management system for all checkout-related data and actions.

## Architecture Overview

The provider follows a reducer pattern with a centralized state and action-based updates. It manages both raw Commerce Layer order data and computed UI state derived from that data.

### Core Components

- **CheckoutProvider**: Main React context provider component
- **CheckoutContext**: React context for state and actions
- **useCheckoutContext**: Hook for consuming the context
- **reducer.ts**: State management with action-based updates
- **utils.ts**: Utility functions for calculations and API operations

## State Structure

The provider maintains an `AppStateData` interface that extends `FetchOrderByIdResponse` and includes:

### Raw Order Data

- `order`: The Commerce Layer Order object
- `isLoading`, `isFirstLoading`: Loading states

### Customer Information

- `isGuest`: Whether the order is for a guest user
- `hasCustomer`: Whether order has an associated customer
- `hasEmailAddress`: Whether customer email is set
- `emailAddress`: The customer's email address

### Address Management

- `hasBillingAddress`, `hasShippingAddress`: Address presence flags
- `billingAddress`, `shippingAddress`: Address objects
- `isUsingNewBillingAddress`, `isUsingNewShippingAddress`: New address flags
- `hasSameAddresses`: Whether billing and shipping addresses are identical
- `hasCustomerAddresses`: Whether customer has saved addresses
- `customerAddresses`: Array of customer's saved addresses
- `requiresBillingInfo`: Whether billing info is required

### Shipping Information

- `isShipmentRequired`: Whether order requires shipping
- `hasShippingMethod`: Whether shipping method is selected
- `shipments`: Array of prepared shipment data
- `shippingCountryCodeLock`: Country code restriction
- `shippingMethodName`: Selected shipping method name

### Payment Information

- `hasPaymentMethod`: Whether payment method is configured
- `isPaymentRequired`: Whether payment is required (non-zero total)
- `paymentMethod`: Selected payment method object
- `isCreditCard`: Whether payment method is credit card
- `paymentSource`: Payment source configuration

### License Information

- `hasLicenseOwner`: Whether order has license owner metadata
- `isLicenseForClient`: Whether license is for a client
- `licenseOwner`: License owner details

### Order Settings

- `isComplete`: Whether order is placed
- `returnUrl`: URL to return to after completion
- `cartUrl`: URL to return to cart
- `taxIncluded`: Whether tax is included in prices

## State Management: The `others` Field

A key architectural pattern in this provider is the use of the `others` field in action payloads. This field contains computed state derived from the raw Commerce Layer order object via the `calculateSettings` function.

### What `calculateSettings` Returns

The `calculateSettings` utility function processes the raw order data and returns computed UI state including:

- Customer status flags and email information
- Address presence, usage patterns, and relationships
- License metadata and ownership details
- Shipping requirements and method selection status
- Payment method configuration and requirements
- Order configuration settings (URLs, tax inclusion, etc.)

### Usage Pattern

Most action dispatchers follow this pattern:

```typescript
const others = calculateSettings(
  currentOrder,
  state.isShipmentRequired,
  state.customerAddresses
)

dispatch({
  type: ActionType.SOME_ACTION,
  payload: {
    order: currentOrder,
    others, // Contains all computed state
  },
})
```

This ensures that whenever the raw order changes, all derived UI state is recalculated and stays in sync.

## Action Types and Flows

### Core Actions

- `SET_ORDER`: Initial order setup with full state calculation
- `UPDATE_ORDER`: Order updates (now properly handles `others` field)
- `START_LOADING` / `STOP_LOADING`: Loading state management

### Customer Flow

- `SET_CUSTOMER_EMAIL`: Set customer email address

### Address Flow

- `SET_ADDRESSES`: Address selection and validation

### Shipping Flow

- `SELECT_SHIPMENT`: Individual shipment method selection
- `SAVE_SHIPMENTS`: Save all shipment configurations

### Payment Flow

- `SET_PAYMENT`: Payment method selection
- `CHANGE_COUPON_OR_GIFTCARD`: Apply/remove promotional codes

### Order Completion

- `PLACE_ORDER`: Final order placement
- `SET_LICENSE_OWNER`: License owner assignment

## Key Methods

### Order Management

- `getOrderFromRef()`: Get current order from internal ref
- `fetchInitialOrder()`: Initial order loading and setup
- `updateOrder()`: Generic order update utility

### Customer Management

- `saveCustomerUser()`: Set customer email
- `setCustomerPassword()`: Set customer password

### Address Management

- `setAddresses()`: Configure billing/shipping addresses
- `createBillingAddress()`: Create new billing address
- `updateBillingAddress()`: Update existing billing address
- `attachBillingAddressToOrder()`: Attach address to order

### Shipping Management

- `selectShipment()`: Select shipping method for shipment
- `autoSelectShippingMethod()`: Auto-select shipping methods
- `saveShipments()`: Save shipment configurations

### Payment Management

- `setPayment()`: Configure payment method
- `loadPaymentMethods()`: Load available payment methods
- `setCouponOrGiftCard()`: Apply promotional codes

### Order Completion

- `placeOrder()`: Complete the order
- `setLicenseOwner()`: Set license ownership

## Payment Methods Integration

The provider includes a `loadPaymentMethods` utility that:

1. Fetches payment methods using the `fetchPaymentMethods` utility
2. Merges payment method data with existing order state
3. Recalculates computed state via `calculateSettings`
4. Updates provider state via `UPDATE_ORDER` action with `others` field

This ensures payment methods are available when needed while maintaining state consistency.

## Usage Example

```typescript
function CheckoutStep() {
  const { order, hasPaymentMethod, isLoading, loadPaymentMethods, setPayment } =
    useCheckoutContext()

  useEffect(() => {
    // Load payment methods when component mounts
    if (order && !order.available_payment_methods) {
      loadPaymentMethods()
    }
  }, [order, loadPaymentMethods])

  // Use order.available_payment_methods for UI rendering
  return (
    <div>
      {order?.available_payment_methods?.map((method) => (
        <PaymentOption
          key={method.id}
          method={method}
          onSelect={() => setPayment({ payment: method })}
        />
      ))}
    </div>
  )
}
```

## Important Notes

### State Consistency

- The `others` field is crucial for maintaining computed state consistency
- Always recalculate `others` when the raw order data changes
- The `UPDATE_ORDER` action properly merges `others` into provider state

### Order Reference Management

- `orderRef.current` maintains a reference to the current order
- This ref is updated by the `getOrder` callback from OrderContainer
- Use `getOrderFromRef()` to access the most current order data

### Loading States

- `isFirstLoading`: True during initial order fetch
- `isLoading`: True during any async operations
- Always dispatch `START_LOADING` before async operations

### Address Handling

- Customer addresses are preserved in reducer state since they're not always included in order fetches
- Address-related computed state is recalculated whenever addresses change

### Error Handling

- Most async methods return `{ success: boolean, error?: unknown, order?: Order }`
- Handle errors appropriately in consuming components
- Provider methods include built-in error handling and fallbacks

## Integration with Commerce Layer

The provider integrates with Commerce Layer SDK through:

- Order retrieval and updates
- Address management
- Payment method configuration
- Shipping method selection
- Customer management

All operations maintain proper include relationships to ensure required data is available for state calculations.
