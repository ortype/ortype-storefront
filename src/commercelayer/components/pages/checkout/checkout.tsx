import { useIdentityContext } from '@/commercelayer/providers/Identity'
import {
  Button,
  ButtonGroup,
  Container,
  Steps,
  useSteps,
} from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'

import { MainHeader } from '@/commercelayer/components/pages/checkout/main-header'
import { OrderSummary } from '@/commercelayer/components/pages/checkout/order-summary'
import { StepAddress } from '@/commercelayer/components/pages/checkout/step-address'
import { StepComplete } from '@/commercelayer/components/pages/checkout/step-complete'
import { StepEmail } from '@/commercelayer/components/pages/checkout/step-email'
import { StepLicense } from '@/commercelayer/components/pages/checkout/step-license'
import { StepNav } from '@/commercelayer/components/pages/checkout/step-nav'
import { StepPayment } from '@/commercelayer/components/pages/checkout/step-payment'
import { PaymentContainer } from '@/commercelayer/components/pages/checkout/step-payment/payment-container'
import StepPlaceOrder from '@/commercelayer/components/pages/checkout/step-place-order'
import { StepShipping } from '@/commercelayer/components/pages/checkout/step-shipping'
import type { SingleStepEnum } from '@/commercelayer/components/pages/checkout/types'
import { CheckoutContext } from '@/commercelayer/providers/checkout'

interface Props {
  logoUrl?: string
  orderNumber: number
  companyName: string
  supportEmail?: string
  supportPhone?: string
  termsUrl?: string
  privacyUrl?: string
}

const BASE_STEPS: Array<{
  key: SingleStepEnum
  title: string
  description?: string
}> = [
  { key: 'Email', title: 'Email', description: 'Enter your email address' },
  {
    key: 'Address',
    title: 'Address',
    description: 'Enter billing and shipping addresses',
  },
  { key: 'License', title: 'License', description: 'License information' },
  { key: 'Shipping', title: 'Shipping', description: 'Select shipping method' },
  { key: 'Payment', title: 'Payment', description: 'Payment and place order' },
]

const Checkout: React.FC<Props> = ({
  logoUrl,
  orderNumber,
  companyName,
  supportEmail,
  supportPhone,
  termsUrl,
  privacyUrl,
}) => {
  const ctx = useContext(CheckoutContext)
  const { customer } = useIdentityContext()

  const params = useParams()
  // Track when initial load step advancement has been completed
  const [initialStepAdvancementDone, setInitialStepAdvancementDone] = useState(false)

  // Filter steps based on checkout requirements
  const steps = BASE_STEPS.filter((step) => {
    if (step.key === 'Shipping' && !ctx?.isShipmentRequired) {
      return false
    }
    if (step.key === 'License' && ctx?.isShipmentRequired) {
      return false
    }
    return true
  })

  // Initialize stepper with correct starting step
  const stepperHook = useSteps({
    defaultStep: 0,
    count: steps.length,
  })

  // Determine the correct current step based on checkout state (ONLY on initial load)
  useEffect(() => {
    // Only run automatic step advancement when:
    // 1. Context is available
    // 2. Initial loading is complete (isFirstLoading just changed from true to false)
    // 3. We haven't already performed initial step advancement
    if (!ctx || ctx.isFirstLoading || initialStepAdvancementDone) return

    console.log('🔍 Initial step advancement - determining current step based on state:')
    console.log('  customer.userMode:', customer.userMode)
    console.log('  ctx.hasEmailAddress:', ctx.hasEmailAddress)
    console.log('  ctx.hasBillingAddress:', ctx.hasBillingAddress)
    console.log('  ctx.hasLicenseOwner:', ctx.hasLicenseOwner)
    console.log('  ctx.isShipmentRequired:', ctx.isShipmentRequired)

    let targetStepIndex = 0 // Default to Email step

    // Logic similar to useActiveStep hook
    const canSelectLicenseOwner = customer.userMode && ctx.hasBillingAddress
    const canSelectPayment =
      customer.userMode && ctx.hasBillingAddress && ctx.hasLicenseOwner

    if (canSelectPayment) {
      targetStepIndex = steps.findIndex((s) => s.key === 'Payment')
    } else if (canSelectLicenseOwner && !ctx.isShipmentRequired) {
      targetStepIndex = steps.findIndex((s) => s.key === 'License')
    } else if (customer.userMode && ctx.hasEmailAddress) {
      targetStepIndex = steps.findIndex((s) => s.key === 'Address')
    } else {
      targetStepIndex = 0 // Email step
    }

    if (targetStepIndex !== -1 && targetStepIndex !== stepperHook.value) {
      console.log(
        `🚀 Initial step advancement to index ${targetStepIndex} (${steps[targetStepIndex]?.key})`
      )
      stepperHook.setStep(targetStepIndex)
      setInitialStepAdvancementDone(true) // Mark as completed to prevent future automatic advancement
    } else {
      // Even if we don't change step, mark advancement as done to prevent retriggering
      setInitialStepAdvancementDone(true)
    }
  }, [
    ctx?.isFirstLoading,
    ctx?.hasEmailAddress,
    ctx?.hasBillingAddress,
    ctx?.hasLicenseOwner,
    customer.userMode,
    ctx?.isShipmentRequired,
    steps,
    stepperHook,
    initialStepAdvancementDone,
  ])

  let paypalPayerId = ''
  let checkoutComSession = ''
  let redirectResult = ''

  if (params.PayerID) {
    paypalPayerId = params.PayerID as string
  }

  if (params.redirectResult) {
    redirectResult = params.redirectResult as string
  }

  if (params['cko-session-id']) {
    checkoutComSession = params['cko-session-id'] as string
  }

  console.log({ checkoutCtx: ctx, isFirstLoading: ctx?.isFirstLoading })

  if (!ctx || ctx.isFirstLoading) {
    return <div>{'Loading...'}</div>
  }

  // NOTE: at the moment isComplete is true when I guess it should not be
  return (
    <Container my={24} maxW="50rem" centerContent>
      <MainHeader orderNumber={orderNumber} />
      <Steps.RootProvider value={stepperHook}>
        <StepNav steps={steps} />
        {steps.map((step, index) => {
          const stepNumber = index + 1
          return (
            <Steps.Content key={step.key} index={index}>
              {step.key === 'Email' && <StepEmail />}
              {step.key === 'Address' && <StepAddress />}
              {step.key === 'License' && <StepLicense />}
              {step.key === 'Shipping' && <StepShipping />}
              {step.key === 'Payment' && (
                <PaymentContainer>
                  <StepPayment />
                  <StepPlaceOrder termsUrl={termsUrl} privacyUrl={privacyUrl} />
                </PaymentContainer>
              )}
            </Steps.Content>
          )
        })}
        <Steps.CompletedContent>
          <StepComplete
            logoUrl={logoUrl}
            companyName={companyName}
            supportEmail={supportEmail}
            supportPhone={supportPhone}
            orderNumber={orderNumber}
          />
        </Steps.CompletedContent>
      </Steps.RootProvider>
      <OrderSummary />
    </Container>
  )
}

export default Checkout
