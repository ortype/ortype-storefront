# Order Caching Optimization

## Overview

The CheckoutProvider has been optimized to reduce redundant API calls during the initial page load by implementing an order caching system that passes pre-fetched order data down from the container level.

## Architecture

### Flow Before Optimization

1. `CheckoutContainer` fetches order via `getOrder()`
2. `CheckoutProvider` fetches the same order again via `fetchInitialOrder()`
3. `checkIfShipmentRequired()` makes another API call to fetch line items
4. Various other components trigger additional fetches

This resulted in 4-6 API calls for the same order on initial load, leading to Commerce Layer rate limiting (429 errors).

### Flow After Optimization

1. `CheckoutContainer` fetches order once
2. Order data is passed to `CheckoutProvider` via `initialOrder` prop
3. `CheckoutProvider` uses cached data instead of refetching
4. Utility functions check for cached data before making API calls

## Key Components

### CheckoutProvider Props

```typescript
interface CheckoutProviderProps {
  config: CLayerClientConfig
  orderId: string
  initialOrder?: Order  // NEW: Pre-fetched order data
  children?: JSX.Element[] | JSX.Element | null
}
```

### Usage Pattern

```tsx
// Container level - fetch once
const [localOrder, setLocalOrder] = useState<Order>()
const fetchedOrder = await getOrder({ client: cl, orderId })
setLocalOrder(fetchedOrder)

// Provider level - use cached data
<CheckoutProvider 
  config={clientConfig} 
  orderId={orderId} 
  initialOrder={localOrder}  // Pass pre-fetched data
>
  {children}
</CheckoutProvider>
```

### Optimized Utility Functions

#### checkIfShipmentRequired()

```typescript
export async function checkIfShipmentRequired(
  cl: CommerceLayerClient,
  orderId: string,
  cachedOrder?: Order  // NEW: Optional cached order
): Promise<boolean> {
  // Use cached order if available and includes line_items
  let order = cachedOrder
  if (!order || !order.line_items) {
    order = await cl.orders.retrieve(orderId, {
      fields: { line_items: ['item_type', 'item'] },
      include: ['line_items', 'line_items.item'],
    })
  }
  // ... rest of function
}
```

#### fetchInitialOrder()

```typescript
const fetchInitialOrder = async ({
  orderId,
  accessToken,
  preloadedOrder,  // NEW: Use pre-loaded data
}: {
  orderId?: string
  accessToken?: string
  preloadedOrder?: Order
}) => {
  const order = preloadedOrder ?? (await getOrderFromRef())
  // ... rest of function
}
```

## Benefits

1. **Reduced API Calls**: From 4-6 calls down to 1-2 calls on initial load
2. **Faster Load Times**: Eliminates redundant network requests
3. **Rate Limit Prevention**: Avoids Commerce Layer 429 errors
4. **Better UX**: Smoother checkout initialization
5. **Single Order Refresh**: `isValidCheckout` runs only once per order instead of multiple times
6. **Single Order Fetch**: Container fetches each order only once instead of multiple times

## Important Notes

### When Cached Data is Used

- **Initial page load**: Pre-fetched order data is used
- **Utility functions**: Check for cached data before API calls
- **State updates**: Cached order populates initial state

### When Fresh API Calls Still Occur

- **Payment method fetching**: Requires different include parameters
- **Order updates**: When modifying order data
- **Shipping method selection**: May need fresh shipping data
- **Missing cached data**: Falls back to API when cache is incomplete

### Backward Compatibility

The optimization is fully backward compatible:
- `initialOrder` prop is optional
- Functions fall back to API calls if no cached data
- Existing components work without modification

## Monitoring

Use the development console logs to monitor caching effectiveness:

```javascript
// Debug logs show when cached vs fresh data is used
console.log('CheckoutProvider - fetchInitialOrder:', {
  usedCachedData: !!preloadedOrder,
  orderId: order?.id,
  // ... other debug info
})
```

## isValidCheckout Optimization

### Purpose
`isValidCheckout` is a critical function that prepares orders for checkout by:
- **Refreshing order data**: Recalculates prices, taxes, inventory, discounts
- **Clearing payment methods**: Ensures clean checkout start
- **Validating line items**: Confirms order has purchasable items
- **Enabling autorefresh**: Allows real-time updates during checkout

### Problem Before Optimization
```javascript
// BEFORE: Called multiple times due to useEffect dependencies
useEffect(() => {
  isValidCheckout(...) // Called 6+ times!
}, [orderId, localLoading, localOrder, localError, paymentReturn, redirectResult, clientConfig])
```

### Solution After Optimization
```javascript
// AFTER: Prevented duplicate calls with ref tracking
const validatedOrderRef = useRef<string | null>(null)

useEffect(() => {
  if (validatedOrderRef.current !== localOrder.id) {
    validatedOrderRef.current = localOrder.id
    isValidCheckout(...) // Called only once per order!
  }
}, [...])
```

### API Call Details
When `isValidCheckout` runs, it makes this critical Commerce Layer API call:
```javascript
await cl.orders.update({
  id: orderId,
  _refresh: true,                    // Triggers recalculation
  payment_method: null,              // Clears existing payment
  autorefresh: true                  // Enables live updates
})
```

## Duplicate Order Fetch Optimization

### Problem
CheckoutContainer was fetching the same order multiple times due to useEffect dependency changes:
```javascript
// BEFORE: Fetched multiple times when clientConfig changes
useEffect(() => {
  if (orderId && clientConfig) {
    fetchOrderById(orderId) // Called 3+ times for same orderId!
  }
}, [orderId, clientConfig, fetchOrderById])
```

### Solution
Added ref-based tracking to ensure each order is only fetched once:
```javascript
// AFTER: Only fetch once per unique orderId
const fetchedOrderRef = useRef<string | null>(null)

useEffect(() => {
  if (orderId && clientConfig && fetchedOrderRef.current !== orderId) {
    fetchedOrderRef.current = orderId
    fetchOrderById(orderId) // Called only once per orderId!
  }
}, [orderId, clientConfig, fetchOrderById])
```

### Result
- ✅ "Order fetched successfully" appears only **once** per order
- ✅ Eliminates redundant network requests
- ✅ Prevents Commerce Layer rate limiting
- ✅ Faster checkout initialization

## Future Enhancements

- **Smart cache invalidation**: Detect when cached data is stale
- **Granular caching**: Cache specific data subsets (addresses, payment methods)
- **Cache warming**: Pre-fetch related data during idle time
