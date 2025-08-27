# StepNav Component

A React component that provides step-by-step navigation for the checkout process. This component creates a visual progress indicator and handles navigation logic between different checkout steps.

## Overview

The StepNav component integrates with Commerce Layer's checkout context and Chakra UI's Steps component to provide:
- Visual step progression
- Smart navigation controls
- Step completion validation
- Internationalization support

## Props

```typescript
interface Props {
  variant?: 'line' | 'solid'
  showDescription?: boolean
  steps: Array<{
    key: SingleStepEnum
    title: string
    description?: string
  }>
}
```

### Props Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'line' \| 'solid'` | `'line'` | Visual style of the step indicators |
| `showDescription` | `boolean` | `false` | Whether to display step descriptions |
| `steps` | `Array<StepConfig>` | - | **Required.** Array of step configurations |

### Step Configuration

Each step in the `steps` array should have:
- `key`: A `SingleStepEnum` value ('Email', 'Address', 'License', 'Shipping', 'Payment', 'Complete')
- `title`: Display title for the step
- `description`: Optional description text

## Navigation Logic

The component implements intelligent navigation rules:

### When Order is NOT Complete

1. **Backward Navigation**: Users can navigate to any completed step
2. **First Step Access**: The first step is always accessible
3. **Forward Navigation**: Users can move to the next incomplete step only if all previous steps are complete

### When Order IS Complete

- **All Navigation Disabled**: Once `ctx.isComplete` is true, no step navigation is allowed
- This prevents users from modifying completed orders

## Step Completion Logic

Each step has specific completion criteria checked via the checkout context:

| Step | Completion Criteria |
|------|-------------------|
| Email | `ctx.hasEmailAddress` |
| Address | `ctx.hasBillingAddress && (!ctx.isShipmentRequired \|\| ctx.hasShippingAddress)` |
| License | `ctx.hasLicenseOwner` |
| Shipping | `!ctx.isShipmentRequired \|\| ctx.hasShippingMethod` |
| Payment | `ctx.hasPaymentMethod` |

## Usage Example

```tsx
import { StepNav } from './step-nav'

const checkoutSteps = [
  { key: 'Email', title: 'Email', description: 'Enter your email' },
  { key: 'Address', title: 'Address', description: 'Billing & shipping' },
  { key: 'License', title: 'License', description: 'Select license owner' },
  { key: 'Shipping', title: 'Shipping', description: 'Choose shipping method' },
  { key: 'Payment', title: 'Payment', description: 'Payment details' }
]

function Checkout() {
  return (
    <Steps.RootProvider value={stepperHook}>
      <StepNav 
        steps={checkoutSteps}
        variant="line"
        showDescription={true}
      />
      {/* Step content components */}
    </Steps.RootProvider>
  )
}
```

## Dependencies

- **React**: Component framework
- **Chakra UI Steps**: UI component library for step navigation
- **Commerce Layer Checkout Context**: Provides checkout state
- **react-i18next**: Internationalization support

## Context Requirements

This component requires:
- `CheckoutContext` from `@/commercelayer/providers/checkout`
- Chakra UI's `Steps.RootProvider` wrapper
- Translation context via `react-i18next`

## Internationalization

The component supports i18n through translation keys:
- Step titles: `step${stepKey}.title` (e.g., `stepEmail.title`)
- Step descriptions: `step${stepKey}.description` (e.g., `stepEmail.description`)

Fallback to the provided `title` and `description` props if translations are not available.

## Visual States

Steps can appear in several visual states:
- **Clickable/Active**: Steps that can be navigated to (wrapped in `Steps.Trigger`)
- **Non-clickable**: Steps that cannot be navigated to (no trigger wrapper)
- **Complete**: Steps that have been completed (determined by completion logic)
- **Disabled**: All steps become non-clickable when order is complete

## Accessibility

- Uses Chakra UI's accessible Steps component
- Proper semantic markup for screen readers
- Clear visual indicators for step states
