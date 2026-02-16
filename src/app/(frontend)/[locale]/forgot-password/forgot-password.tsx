'use client'
import { Input } from '@/commercelayer/components/ui/Input'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { isValidCommerceLayerConfig } from '@/commercelayer/utils/getCommerceLayer'
import { Alert } from '@/components/ui/alert'
import {
  Box,
  Button,
  Link as ChakraLink,
  Container,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
})

interface FormData {
  email: string
}

export default function ForgotPassword({ accessToken }) {
  const { clientConfig, config, isLoading } = useIdentityContext()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (formData) => {
    setApiError(null)

    // @TODO check for valid access token
    /*
    if (!isValidCommerceLayerConfig(clientConfig)) {
      setApiError('Configuration error. Please try again later.')
      return
    }
    */

    try {
      if (accessToken) {
        const response = await fetch(
          `${config.endpoint}/api/customer_password_resets`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/vnd.api+json',
              Accept: 'application/vnd.api+json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              data: {
                type: 'customer_password_resets',
                attributes: {
                  customer_email: formData.email,
                },
              },
            }),
          }
        )

        console.log({ response })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        // If no access token but no error thrown, treat as invalid credentials
        form.setError('root', {
          type: 'INVALID_CREDENTIALS',
          message: 'The email or password you entered is incorrect.',
        })
      }

      setIsSubmitted(true)
    } catch (error: any) {
      console.error('Password reset error:', error)
      // Check if it's a real error or just Commerce Layer's security behavior
      if (error?.errors?.[0]?.code === 'UNAUTHORIZED') {
        setApiError(
          'Unable to send password reset email. Please try again later.'
        )
      } else {
        // Commerce Layer returns success even for non-existent emails for security
        // So we'll show success message for most errors
        setIsSubmitted(true)
      }
    }
  })

  if (isLoading) {
    return (
      <Container maxW="md" py={8}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  if (isSubmitted) {
    return (
      <Container maxW="md" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Check your email
          </Heading>
          <Text mb={6} color="gray.600">
            If an account with that email exists, we've sent you a password
            reset link.
          </Text>
          <ChakraLink as={Link} href="/" color="blue.500">
            Return to homepage
          </ChakraLink>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="md" py={8}>
      <Box>
        <Alert status="warning">
          {
            'Not ready for use! The reset password link is not yet being sent via email.'
          }
        </Alert>
        <Heading size="lg" mb={2}>
          Forgot your password?
        </Heading>
        <Text mb={6} color="gray.600">
          Enter your email address and we'll send you a link to reset your
          password.
        </Text>

        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <Stack gap={4}>
              <Input
                name="email"
                label="Email address"
                type="email"
                placeholder="Enter your email"
              />

              {apiError && <Alert status="error">{apiError}</Alert>}

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Sending..."
                disabled={isSubmitting}
                variant="solid"
                colorScheme="blue"
              >
                Send reset link
              </Button>

              <Text textAlign="center">
                Remember your password?{' '}
                <ChakraLink as={Link} href="/" color="blue.500">
                  Sign in
                </ChakraLink>
              </Text>
            </Stack>
          </form>
        </FormProvider>
      </Box>
    </Container>
  )
}
