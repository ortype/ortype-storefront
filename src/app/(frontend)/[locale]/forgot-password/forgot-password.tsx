'use client'
import { Input } from '@/commercelayer/components/ui/Input'
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
import { useParams } from 'next/navigation'
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

export default function ForgotPassword() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (formData) => {
    setApiError(null)

    try {
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, locale }),
      })

      const data = await response.json()

      if (!response.ok && !data.success) {
        setApiError(
          data.error || 'Unable to process your request. Please try again.'
        )
        return
      }

      setIsSubmitted(true)
    } catch (error: any) {
      console.error('Password reset error:', error)
      setApiError('Something went wrong. Please try again later.')
    }
  })

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
