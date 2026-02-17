import { LoginForm as LoginFormNew } from '@/commercelayer/components/forms/LoginForm'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { Box, Center, Spinner, Container } from '@chakra-ui/react'
import { useContext, useEffect, useState } from 'react'
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
  const { customer, checkCustomerEmail, setCustomerEmail, settings } =
    useIdentityContext()
  const { hasEmailAddress, emailAddress } = checkoutCtx

  // @NOTE: not doing anything yet with this state
  const [isLocalLoader, setIsLocalLoader] = useState(false)

  useEffect(() => {
    if (emailAddress && !customer.checkoutEmail) {
      checkCustomerEmail(emailAddress)
    }
  }, [emailAddress])

  if (!checkoutCtx) {
    return null
  }

  // @NOTE: Use checkout provider's emailAddress as the source of truth
  // since it persists across page refreshes and comes from the order data
  // The identity provider's customer.email is for authenticated customers
  // in case we are logged in but have not created an order yet
  const email = emailAddress || customer.email

  // Derive which auth form to show (Login vs Sign-Up)
  // Use IdentityProvider's customer.checkoutEmailHasAccount property: false = customer has password (show Login), true = guest (show Sign-Up)
  // Provide graceful fallback: show Sign-Up if order.guest is undefined
  const requiresLogin = customer.checkoutEmailHasAccount && hasEmailAddress

  if (customer.isLoading) {
    return (
      <Box pos="fixed" inset="0" bg="bg/80">
        <Center h="full">
          <Spinner color="black" size={'xl'} />
        </Center>
      </Box>
    )
  }

  if (customer.userMode) {
    return (
      <Container
        centerContent
        my={4}
      >{`Logged in as ${emailAddress}`}</Container>
    )
  }

  return (
    <Container centerContent my={4}>
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
    </Container>
  )
}
