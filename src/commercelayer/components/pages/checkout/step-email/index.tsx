import { LoginForm as LoginFormNew } from '@/commercelayer/components/forms/LoginForm'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Box, Flex } from '@chakra-ui/react'
import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Email } from './Email'
import { SignUpForm } from './signup-form'

interface Props {
  className?: string
  step: number
}

export interface ShippingToggleProps {
  forceShipping?: boolean
  disableToggle: boolean
}

export const StepEmail: React.FC<Props> = () => {
  const checkoutCtx = useContext(CheckoutContext)
  const { customer, setCustomerEmail } = useIdentityContext()
  const { hasEmailAddress, emailAddress, isGuest, hasCustomer } = checkoutCtx

  // @NOTE: not doing anything yet with this state
  const [isLocalLoader, setIsLocalLoader] = useState(false)

  if (!checkoutCtx) {
    return null
  }

  // @NOTE: Use checkout provider's emailAddress as the source of truth
  // since it persists across page refreshes and comes from the order data
  // The identity provider's customer.email is for authenticated customers only
  const email = emailAddress || customer.email

  // Derive which auth form to show (Login vs Sign-Up)
  // Use CheckoutContext.isGuest property: false = customer has password (show Login), true = guest (show Sign-Up)
  // Provide graceful fallback: show Sign-Up if order.guest is undefined
  const requiresLogin = !isGuest && hasEmailAddress

  return (
    <>
      {hasEmailAddress ? (
        <>
          {requiresLogin ? (
            <LoginFormNew emailAddress={email} />
          ) : (
            <SignUpForm emailAddress={email} />
          )}
        </>
      ) : (
        <Email emailAddress={email} setCustomerEmail={setCustomerEmail} />
      )}
    </>
  )
}
