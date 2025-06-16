import { LoginForm as LoginFormNew } from '@/commercelayer/components/forms/LoginForm'
import { SignUpForm } from '@/commercelayer/components/forms/SignUpForm'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { AccordionContext } from '@/commercelayer/providers/accordion'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { StepContainer } from '@/components/ui/StepContainer'
import { StepHeader } from '@/components/ui/StepHeader'
import { Box, Flex } from '@chakra-ui/react'
import classNames from 'classnames'
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

  // @NOTE: not doing anything yet with this state
  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }

  // @NOTE: Use checkout provider's emailAddress as the source of truth
  // since it persists across page refreshes and comes from the order data
  // The identity provider's customer.email is for authenticated customers only
  const email = emailAddress || customer.email

  return (
    <StepContainer
      className={classNames({
        current: accordionCtx.isActive,
        done: !accordionCtx.isActive,
        submitting: isLocalLoader,
      })}
    >
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
              <Email emailAddress={email} setCustomerEmail={setCustomerEmail} />
            )}
          </>
        )}
      </>
    </StepContainer>
  )
}
