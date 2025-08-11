# Shipping Flow Migration TODOs

This document outlines the required tasks to complete the shipping address flow migration to the new address provider system.

## Current Status
✅ **COMPLETED:**
- Billing address form with new AddressProvider
- Client-side validation for billing addresses
- Address saving to Commerce Layer API
- Accordion navigation from billing to license step
- Error handling and display

## TODO: Shipping Address Implementation

### 1. Create Shipping Address Form Component
- [ ] Create `shipping-address-form-new/index.tsx` component
- [ ] Implement similar pattern to `billing-address-form-new`
- [ ] Use AddressProvider for state management
- [ ] Add validation for shipping-specific fields
- [ ] Handle country/state selection logic

### 2. Update AddressProvider for Shipping
- [ ] Add shipping address state to `address/index.tsx`
- [ ] Implement `saveShippingAddress` action
- [ ] Add shipping address validation
- [ ] Handle shipping/billing address linking logic

### 3. Shipping Address Utilities
- [ ] Add shipping address creation in `utils/address.ts`
- [ ] Implement `createShippingAddress` function
- [ ] Add `setOrderShippingAddress` function
- [ ] Handle address validation for shipping

### 4. Update Step Address Component
- [ ] Replace shipping address placeholder in `step-address/index.tsx`
- [ ] Implement shipping address form rendering
- [ ] Add shipping address save logic
- [ ] Update accordion progression logic

### 5. Checkout Context Updates
- [ ] Add shipping address helpers to checkout provider
- [ ] Implement shipping address state management
- [ ] Update order refresh logic for shipping addresses

### 6. Testing & Validation
- [ ] Manual QA for shipping address flow
- [ ] Test shipping/billing address toggle
- [ ] Verify order updates with shipping addresses
- [ ] Test accordion navigation with shipping step

### 7. Error Handling & UX
- [ ] Implement shipping address error display
- [ ] Add loading states for shipping operations
- [ ] Handle shipping address validation errors
- [ ] Add proper error messages for shipping fields

### 8. Integration Points
- [ ] Update shipping method selection logic
- [ ] Ensure compatibility with existing shipping providers
- [ ] Test international shipping address formats
- [ ] Verify shipping cost calculations

## Notes
- Current implementation skips shipping address when `isShipmentRequired` is false
- Billing address can be used as shipping address via `useAsShipping` flag
- Address provider pattern established can be reused for shipping addresses
- Validation and error handling patterns are established and can be copied

## File Structure for Shipping Implementation
```
src/commercelayer/components/pages/checkout/step-address/
├── shipping-address-form-new/
│   └── index.tsx
├── shipping-address-form/
│   └── index.tsx (legacy - can be updated to use new provider)
└── index.tsx (update to include shipping form)
```

## References
- Billing address implementation: `billing-address-form-new/index.tsx`
- Address provider: `src/commercelayer/providers/address/index.tsx`
- Save button pattern: `src/components/ui/save-billing-address-button/index.tsx`
