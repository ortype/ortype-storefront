import CustomerContainer from '@commercelayer/react-components/customers/CustomerContainer'
import OrderContainer from '@commercelayer/react-components/orders/OrderContainer'
import PlaceOrderContainer from '@commercelayer/react-components/orders/PlaceOrderContainer'
import { useParams } from 'next/navigation'
import { useContext } from 'react'

import { MainHeader } from '@/components/composite/MainHeader'
import { OrderSummary } from '@/components/composite/OrderSummary'
import {
  StepAddress,
  StepHeaderCustomer,
} from '@/components/composite/StepAddress'
import { StepComplete } from '@/components/composite/StepComplete'
import { StepEmail, StepHeaderEmail } from '@/components/composite/StepEmail'
import {
  StepHeaderLicense,
  StepLicense,
} from '@/components/composite/StepLicense'
import { StepNav } from '@/components/composite/StepNav'
import {
  StepHeaderPayment,
  StepPayment,
} from '@/components/composite/StepPayment'
import { PaymentContainer } from '@/components/composite/StepPayment/PaymentContainer'
import StepPlaceOrder from '@/components/composite/StepPlaceOrder'
import {
  StepHeaderShipping,
  StepShipping,
} from '@/components/composite/StepShipping'
import { AccordionProvider } from '@/components/data/AccordionProvider'
import { CheckoutContext } from '@/components/data/CheckoutProvider'
import { useActiveStep } from '@/components/hooks/useActiveStep'
import { LayoutDefault } from '@/components/layouts/LayoutDefault'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Footer } from '@/components/ui/Footer'
import { Logo } from '@/components/ui/Logo'

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
      <CustomerContainer isGuest={ctx.isGuest}>
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
                          <StepHeaderShipping
                            step={getStepNumber('Shipping')}
                          />
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
                    header={
                      <StepHeaderLicense step={getStepNumber('License')} />
                    }
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
                    <PlaceOrderContainer
                      options={{
                        paypalPayerId,
                        checkoutCom: { session_id: checkoutComSession },
                        adyen: {
                          redirectResult,
                        },
                      }}
                    >
                      <AccordionItem
                        index={3}
                        header={
                          <StepHeaderPayment step={getStepNumber('Payment')} />
                        }
                      >
                        <div className="mb-6">
                          <StepPayment />
                        </div>
                      </AccordionItem>
                      <StepPlaceOrder
                        isActive={
                          activeStep === 'Payment' || activeStep === 'Complete'
                        }
                        termsUrl={termsUrl}
                        privacyUrl={privacyUrl}
                      />
                    </PlaceOrderContainer>
                  </PaymentContainer>
                </AccordionProvider>
              </Accordion>
            </>
          }
        />
      </CustomerContainer>
    )
  }

  return (
    <OrderContainer orderId={ctx.orderId} fetchOrder={ctx.getOrder as any}>
      {ctx.isComplete ? renderComplete() : renderSteps()}
    </OrderContainer>
  )
}

export default Checkout
