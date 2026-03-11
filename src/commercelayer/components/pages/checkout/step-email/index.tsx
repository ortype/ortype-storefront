import { LoginForm } from '@/commercelayer/components/forms/LoginForm'
import { CheckoutContext } from '@/commercelayer/providers/checkout'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import {
  Box,
  Button,
  Center,
  Link as ChakraLink,
  Container,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useContext, useEffect } from 'react'
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
  const { customer, config, checkCustomerEmail, setCustomerEmail, settings } =
    useIdentityContext()
  const { hasEmailAddress, emailAddress } = checkoutCtx
  const { resetPasswordUrl } = config
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
  // Wait until the email check completes before deciding
  const requiresLogin =
    !customer.isCheckingEmail &&
    customer.checkoutEmailHasAccount &&
    hasEmailAddress

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
      <Container centerContent my={4} textAlign={'center'}>
        <Text textStyle={'2xl'}>{`Logged in as ${emailAddress}`}</Text>
      </Container>
    )
  }

  return (
    <Container centerContent my={4} maxW={'30rem'} position={'relative'}>
      {hasEmailAddress ? (
        <>
          {customer.isCheckingEmail ? (
            <Center h="full">
              <Spinner color="black" size={'xl'} />
            </Center>
          ) : requiresLogin ? (
            <>
              <VStack gap={2}>
                <LoginForm emailAddress={email} />
                {resetPasswordUrl.length > 0 && (
                  <Button
                    asChild
                    size={'2xs'}
                    bg={'brand.50'}
                    variant={'subtle'}
                    borderRadius={'full'}
                  >
                    <ChakraLink
                      target="_blank"
                      as={Link}
                      href={`${resetPasswordUrl}`}
                    >
                      Forgot password?
                    </ChakraLink>
                  </Button>
                )}{' '}
              </VStack>
            </>
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
