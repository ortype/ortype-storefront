# Payment Sources Setup

This document describes how to set up and use the new payment source components (StripePayment and WireTransferPayment) in your checkout flow.

## Installation

To use the Stripe payment component, you need to install the required Stripe dependencies:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
# or
yarn add @stripe/stripe-js @stripe/react-stripe-js
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Components Overview

### StripePayment Component

The `StripePayment` component provides a complete Stripe payment form integration:

- Handles Stripe Elements setup
- Manages payment confirmation
- Integrates with your CheckoutProvider
- Supports save-to-wallet functionality

### WireTransferPayment Component

The `WireTransferPayment` component provides a wire transfer payment option:

- Displays informational message about wire transfer process
- Handles payment method selection
- No external dependencies required

## Integration

The components are automatically integrated into your checkout flow via the `CheckoutCustomerPayment` component. The system will:

1. Load available payment methods using `loadPaymentMethods` from CheckoutProvider
2. Display the appropriate payment form based on the `payment_source_type`
3. Handle payment processing through the respective component

### Supported Payment Types

- `stripe_payments` → Renders StripePayment component
- `wire_transfers` → Renders WireTransferPayment component
- Other types → Shows fallback message

## Usage Example

```tsx
import { StripePayment, WireTransferPayment } from '@/commercelayer/components/payment-sources'

// Stripe Payment
<StripePayment
  publishableKey="pk_test_..."
  clientSecret="pi_client_secret_..."
  containerClassName="mt-4"
  show={true}
/>

// Wire Transfer Payment
<WireTransferPayment
  containerClassName="mt-4"
  show={true}
  infoMessage={{
    text: "Custom wire transfer instructions...",
    className: "text-sm text-blue-700"
  }}
/>
```

## How It Works

1. **Payment Method Loading**: The CheckoutProvider's `loadPaymentMethods` function loads available payment methods for the order
2. **Method Selection**: Users can select from available payment methods displayed by the PaymentMethod component
3. **Form Rendering**: Based on the selected payment method's `payment_source_type`, the appropriate form component is rendered
4. **Payment Processing**: Each component handles its own payment processing logic
5. **State Updates**: Successful payments update the CheckoutProvider state via the `setPayment` method

## Architecture Integration

The payment source components integrate with your existing architecture:

- **CheckoutProvider**: Provides order data, payment methods, and state management
- **PaymentMethodContext**: Provides the currently selected payment method
- **PaymentSourceContext**: Provides payment source details for existing saved cards

## Testing

To test the payment components:

1. Set up test environment variables with Stripe test keys
2. Use test payment methods provided by Stripe
3. Test both successful and failed payment scenarios
4. Verify integration with your order completion flow

## Next Steps

After setup, you should:

1. Install the Stripe dependencies
2. Configure environment variables
3. Test the payment flow in development
4. Configure webhook endpoints for payment confirmation (Stripe)
5. Set up payment method configurations in Commerce Layer dashboard
