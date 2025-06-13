import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { useContext, useEffect, useState } from 'react'

interface UseActiveStep {
  activeStep: SingleStepEnum
  setActiveStep: (step: SingleStepEnum) => void
  lastActivableStep: SingleStepEnum
  isLoading: boolean
  steps: SingleStepEnum[]
}

// @TODO: "Cart", "Email", "Address", "License", "Payment"
const STEPS: SingleStepEnum[] = [
  // 'Cart',
  'Email',
  'Address',
  'License',
  'Shipping',
  'Payment',
]

export function checkIfCannotGoNext(
  step: SingleStepEnum,
  steps: SingleStepEnum[],
  lastActivableStep: SingleStepEnum
) {
  if (lastActivableStep === 'Complete') {
    return false
  }
  const indexCurrent = steps.indexOf(step)
  const indexLastActivable = steps.indexOf(lastActivableStep)
  return indexCurrent >= indexLastActivable
}

export const useActiveStep = (): UseActiveStep => {
  const [activeStep, setActiveStep] = useState<SingleStepEnum>('Email')
  const [lastActivableStep, setLastActivableStep] =
    useState<SingleStepEnum>('Email')
  const [steps, setSteps] = useState<SingleStepEnum[]>(STEPS)

  const ctx = useContext(CheckoutContext)
  const { customer } = useIdentityContext()

  if (!ctx)
    return {
      activeStep,
      lastActivableStep,
      setActiveStep,
      isLoading: true,
      steps,
    }

  const { isFirstLoading, isLoading } = ctx

  // @TODO: Add <StepCart /> and 'cart'
  // and a condition

  useEffect(() => {
    if (ctx && (isFirstLoading || !ctx.isLoading)) {
      // Use it to alter steps of checkout
      if (ctx.isShipmentRequired) {
        // setSteps(['Cart', 'Email', 'Address', 'Shipping', 'Payment'])
        setSteps(['Email', 'Address', 'Shipping', 'Payment'])
      } else {
        // setSteps(['Cart', 'Email', 'Address', 'License', 'Payment'])
        setSteps(['Email', 'Address', 'License', 'Payment'])
      }

      const canSetEmail = !customer.userMode || !ctx.hasEmailAddress
      const canSelectCustomerAddress =
        customer.userMode &&
        ctx.hasShippingAddress &&
        ctx.hasBillingAddress &&
        ctx.hasEmailAddress
      const canSelectShippingMethod =
        canSelectCustomerAddress &&
        (ctx.hasShippingAddress || !ctx.isShipmentRequired)
      const canSelectLicenseOwner = customer.userMode && ctx.hasBillingAddress
      const canSelectPayment =
        customer.userMode && ctx.hasBillingAddress && ctx.hasLicenseOwner
      const canPlaceOrder =
        canSelectCustomerAddress &&
        canSelectShippingMethod &&
        canSelectPayment &&
        ctx.hasPaymentMethod

      console.log('canSelectCustomerAddress', canSelectCustomerAddress)
      console.log('canSelectShippingMethod', canSelectShippingMethod)
      console.log('canSelectLicenseOwner: ', canSelectLicenseOwner, {
        isGuest: ctx.isGuest,
        hasBillingAddress: ctx.hasBillingAddress,
      })
      console.log('canSelectPayment', canSelectPayment, {
        isCustomer: !ctx.isGuest,
        billingAddress: ctx.hasBillingAddress,
        hasLicenseOwner: ctx.hasLicenseOwner,
      })
      console.log('canPlaceOrder', canPlaceOrder)
      console.log('canSetEmail', canSetEmail)

      if (canPlaceOrder) {
        console.log('Step 5: Complete')
        setActiveStep('Complete')
        setLastActivableStep('Complete')
      } else if (canSelectPayment) {
        console.log('Step 4: Payment')
        setActiveStep('Payment')
        setLastActivableStep('Payment')
        // } else if (canSelectShippingMethod) {
        //   setActiveStep('Shipping')
        //   setLastActivableStep('Shipping')
        // } else if (!ctx.hasLicenseOwner) {
      } else if (canSelectLicenseOwner) {
        console.log('Step 3: Address')
        setActiveStep('License')
        setLastActivableStep('License')
      } else if (customer.userMode && ctx.hasEmailAddress) {
        console.log('Step 2: Address')
        setActiveStep('Address')
        setLastActivableStep('Address')
      } else if (!customer.userMode || !ctx.hasEmailAddress) {
        console.log('Step 1: Email')
        setActiveStep('Email')
        setLastActivableStep('Email')
      }
    }
  }, [isFirstLoading, isLoading])

  return {
    activeStep,
    lastActivableStep,
    setActiveStep,
    isLoading,
    steps,
  }
}
