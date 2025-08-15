import { useParams } from 'next/navigation'
import { useContext } from 'react'

import { MainHeader } from '@/commercelayer/components/pages/checkout/main-header'
import { OrderSummary } from '@/commercelayer/components/pages/checkout/order-summary'
import {
  StepAddress,
  StepHeaderCustomer,
} from '@/commercelayer/components/pages/checkout/step-address'
import { StepComplete } from '@/commercelayer/components/pages/checkout/step-complete'
import {
  StepEmail,
  StepHeaderEmail,
} from '@/commercelayer/components/pages/checkout/step-email'
import {
  StepHeaderLicense,
  StepLicense,
} from '@/commercelayer/components/pages/checkout/step-license'
import { StepNav } from '@/commercelayer/components/pages/checkout/step-nav'
import {
  StepHeaderPayment,
  StepPayment,
} from '@/commercelayer/components/pages/checkout/step-payment'
import { PaymentContainer } from '@/commercelayer/components/pages/checkout/step-payment/payment-container'
import StepPlaceOrder from '@/commercelayer/components/pages/checkout/step-place-order'
import {
  StepHeaderShipping,
  StepShipping,
} from '@/commercelayer/components/pages/checkout/step-shipping'
import { AccordionProvider } from '@/commercelayer/providers/accordion'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { useActiveStep } from '@/components/hooks/useActiveStep'
import { LayoutDefault } from '@/components/layouts/LayoutDefault'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'

interface Props {
  logoUrl?: string
  orderNumber: number
  companyName: string
  supportEmail?: string
  supportPhone?: string
  termsUrl?: string
  privacyUrl?: string
}

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

  const params = useParams()

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

  const { activeStep, lastActivableStep, setActiveStep, steps } =
    useActiveStep()

  const getStepNumber = (stepName: SingleStepEnum) => {
    return steps.indexOf(stepName) + 1
  }

  // @NOTE: checkoutCtx.order stays undefined
  // we already have an order from OrderProvider, but the CheckoutContext order should contain
  // additional data like addressses which we don't need on the buy page or cart

  // @NOTE: after SET_ORDER is called isFirstLoading is set to false

  console.log({ checkoutCtx: ctx, isFirstLoading: ctx?.isFirstLoading })

  if (!ctx || ctx.isFirstLoading) {
    return <div>{'Loading...'}</div>
  }
  const renderComplete = () => {
    return (
      <StepComplete
        logoUrl={logoUrl}
        companyName={companyName}
        supportEmail={supportEmail}
        supportPhone={supportPhone}
        orderNumber={orderNumber}
      />
    )
  }

  const renderSteps = () => {
    return (
      <LayoutDefault
        aside={<OrderSummary checkoutCtx={ctx} />}
        main={
          <>
            <MainHeader orderNumber={orderNumber} />
            <StepNav
              steps={steps}
              activeStep={activeStep}
              onStepChange={setActiveStep}
              lastActivable={lastActivableStep}
            />
            <Accordion>
              <AccordionProvider
                activeStep={activeStep}
                lastActivableStep={lastActivableStep}
                setActiveStep={setActiveStep}
                step="Email"
                steps={steps}
                isStepDone={ctx.hasEmailAddress}
              >
                <AccordionItem
                  index={1}
                  header={<StepHeaderEmail step={getStepNumber('Email')} />}
                >
                  <StepEmail className="mb-6" step={1} />
                </AccordionItem>
              </AccordionProvider>
            </Accordion>
            <Accordion>
              <AccordionProvider
                activeStep={activeStep}
                lastActivableStep={lastActivableStep}
                setActiveStep={setActiveStep}
                step="Address"
                steps={steps}
                isStepDone={ctx.hasShippingAddress && ctx.hasBillingAddress}
              >
                <AccordionItem
                  index={1}
                  header={
                    <StepHeaderCustomer step={getStepNumber('Address')} />
                  }
                >
                  <StepAddress className="mb-6" step={1} />
                </AccordionItem>
              </AccordionProvider>
              <>
                {ctx.isShipmentRequired && (
                  <AccordionProvider
                    activeStep={activeStep}
                    lastActivableStep={lastActivableStep}
                    setActiveStep={setActiveStep}
                    step="Shipping"
                    steps={steps}
                    isStepRequired={ctx.isShipmentRequired}
                    isStepDone={ctx.hasShippingMethod}
                  >
                    <AccordionItem
                      index={2}
                      header={
                        <StepHeaderShipping step={getStepNumber('Shipping')} />
                      }
                    >
                      <StepShipping className="mb-6" step={2} />
                    </AccordionItem>
                  </AccordionProvider>
                )}
              </>
            </Accordion>
            <Accordion>
              <AccordionProvider
                activeStep={activeStep}
                lastActivableStep={lastActivableStep}
                setActiveStep={setActiveStep}
                step="License"
                steps={steps}
                isStepDone={ctx.hasLicenseOwner}
              >
                <AccordionItem
                  index={1}
                  header={<StepHeaderLicense step={getStepNumber('License')} />}
                >
                  <StepLicense className="mb-6" step={1} />
                </AccordionItem>
              </AccordionProvider>
            </Accordion>
            <Accordion>
              <AccordionProvider
                activeStep={activeStep}
                lastActivableStep={lastActivableStep}
                setActiveStep={setActiveStep}
                step="Payment"
                steps={steps}
                isStepRequired={ctx.isPaymentRequired}
                isStepDone={ctx.hasPaymentMethod}
              >
                <PaymentContainer>
                  <AccordionItem
                    index={3}
                    header={
                      <StepHeaderPayment step={getStepNumber('Payment')} />
                    }
                  >
                    <div className="mb-6">
                      <StepPayment />
                    </div>
                    <StepPlaceOrder
                      isActive={
                        activeStep === 'Payment' || activeStep === 'Complete'
                      }
                      termsUrl={termsUrl}
                      privacyUrl={privacyUrl}
                    />
                  </AccordionItem>
                </PaymentContainer>
              </AccordionProvider>
            </Accordion>
          </>
        }
      />
    )
  }

  return <>{ctx.isComplete ? renderComplete() : renderSteps()}</>
}

export default Checkout
