import { LoginForm as LoginFormNew } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { Box } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { AccordionContext } from '@/components/data/AccordionProvider'
import { CheckoutContext } from '@/components/data/CheckoutProvider'
import { StepContainer } from '@/components/ui/StepContainer'
import { StepHeader } from '@/components/ui/StepHeader'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Email } from './Email'

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepHeaderEmail: React.FC<Props> = ({ step }) => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  const { hasEmailAddress, emailAddress } = checkoutCtx

  const { t } = useTranslation()

  const recapText = () => {
    if (!hasEmailAddress || accordionCtx.status === 'edit') {
      return (
        <>
          <p>{t('stepEmail.notSet')}</p>
        </>
      )
    }

    return (
      <>
        <p data-testid="Email-email-step-header">{emailAddress}</p>
      </>
    )
  }

  return (
    <StepHeader
      stepNumber={step}
      status={accordionCtx.status}
      label={t('stepEmail.title')}
      info={recapText()}
      onEditRequest={accordionCtx.setStep}
    />
  )
}

export const StepEmail: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)
  const { customer, setCustomerEmail } = useIdentityContext()
  const { isGuest, hasEmailAddress, hasCustomer, emailAddress } = checkoutCtx

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  // @NOTE: at this stage we are managing the identity/customer in two providers
  // because there is the concept of attaching a `customer_email` to the `order`
  // CLayer allows guest checkout `order.isGuest + order.customer_email`
  // however, we do not allow guest checkout, so we should move away from this logic
  const email = (customer.email && customer.email.length) || emailAddress

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
      <Box>
        <>
          {accordionCtx.isActive && (
            <>
              {hasEmailAddress ? (
                <>
                  {hasCustomer ? (
                    <LoginFormNew emailAddress={email} />
                  ) : (
                    <SignUpForm emailAddress={email} />
                  )}
                </>
              ) : (
                <Email
                  emailAddress={email}
                  setCustomerEmail={setCustomerEmail}
                />
              )}
            </>
          )}
        </>
      </Box>
    </StepContainer>
  )
}
