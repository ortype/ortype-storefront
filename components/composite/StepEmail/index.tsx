import { Box } from '@chakra-ui/react'
import type { Order } from '@commercelayer/sdk'
import classNames from 'classnames'
import { AccordionContext } from 'components/data/AccordionProvider'
import { CheckoutContext } from 'components/data/CheckoutProvider'
import { StepContainer } from 'components/ui/StepContainer'
import { StepHeader } from 'components/ui/StepHeader'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoginForm, RegisterForm } from './Account'
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

const customers = ['newww@owenhoskins.com', 'owen.hoskins@gmail.com']

export const StepEmail: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const accordionCtx = useContext(AccordionContext)

  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx || !accordionCtx) {
    return null
  }
  const { isGuest, emailAddress, hasEmailAddress, setCustomerEmail } =
    checkoutCtx

  const customerExists = customers.find((email) => email === emailAddress)

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
                  {customerExists ? (
                    <LoginForm emailAddress={emailAddress} />
                  ) : (
                    <RegisterForm emailAddress={emailAddress} />
                  )}
                </>
              ) : (
                <Email
                  emailAddress={emailAddress}
                  setCustomerEmail={setCustomerEmail}
                />
              )}
              {/*
                - look up Email via email address (how exactly?)
                  - probably can call an API route with sales channel/app creds to list Emails
                  and check for matches against the entered email address
                  - https://docs.commercelayer.io/core/v/api-reference/Emails/list
                - if it exists show a login-in form
                - otherwise show a sign-up form
                  - remove guest checkout route, require an authenticated user
                - require `!isGuest` before allowing the next step
              */}
            </>
          )}
        </>
      </Box>
    </StepContainer>
  )
}
