import { CheckoutContext } from 'components/data/CheckoutProvider'
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

  if (!ctx)
    return {
      activeStep,
      lastActivableStep,
      setActiveStep,
      isLoading: true,
      steps,
    }

  const { isFirstLoading, isLoading } = ctx

  console.log('Steps: Checkout Context: ', ctx)

  useEffect(() => {
    if (ctx && (isFirstLoading || !ctx.isLoading)) {
      // Use it to alter steps of checkout
      if (ctx.isShipmentRequired) {
        setSteps(['Email', 'Address', 'Shipping', 'Payment'])
      } else {
        setSteps(['Email', 'Address', 'License', 'Payment'])
      }

      const canSelectCustomerAddress =
        !ctx.isGuest &&
        ctx.hasShippingAddress &&
        ctx.hasBillingAddress &&
        ctx.hasEmailAddress
      const canSelectShippingMethod =
        canSelectCustomerAddress &&
        (ctx.hasShippingAddress || !ctx.isShipmentRequired)
      const canSelectPayment =
        canSelectCustomerAddress &&
        canSelectShippingMethod &&
        ctx.hasShippingMethod // && ctx.hasLicenseOwner
      const canPlaceOrder =
        canSelectCustomerAddress &&
        canSelectShippingMethod &&
        canSelectPayment &&
        ctx.hasPaymentMethod
      if (canPlaceOrder) {
        setActiveStep('Complete')
        setLastActivableStep('Complete')
      } else if (canSelectPayment) {
        // && ctx.hasLicenseOwner
        // this condition breaks things, oddly
        setActiveStep('Payment')
        setLastActivableStep('Payment')
      } else if (canSelectShippingMethod) {
        setActiveStep('Shipping')
        setLastActivableStep('Shipping')
      } else if (!ctx.hasLicenseOwner) {
        setActiveStep('License')
        setLastActivableStep('License')
      } else if (!ctx.isGuest) {
        setActiveStep('Address')
        setLastActivableStep('Address')
      } else if (ctx.isGuest || !ctx.hasEmailAddress) {
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
