'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Alert } from '@/components/ui/alert'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .test(
      'password-strength',
      'Password must contain uppercase, lowercase, number, and special character',
      (value) => {
        if (!value) return false

        const hasLowercase = /[a-z]/.test(value)
        const hasUppercase = /[A-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        const hasSpecialChar = /[^\w\s]/.test(value)

        return hasLowercase && hasUppercase && hasNumber && hasSpecialChar
      }
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), ''], 'Passwords must match'),
})

interface FormData {
  password: string
  confirmPassword: string
}

export default function ResetPassword() {
  const { clientConfig, isLoading } = useIdentityContext()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  const isSubmitting = form.formState.isSubmitting
  const watchedPassword = form.watch('password')

  // Calculate password strength (0-4 scale)
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^\w\s]/.test(password)) score++

    return score
  }

  const passwordStrength = calculatePasswordStrength(watchedPassword || '')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setApiError(
        'Invalid or missing reset token. Please request a new password reset.'
      )
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const onSubmit = form.handleSubmit(async (formData) => {
    setApiError(null)

    if (!token) {
      setApiError('Invalid reset token. Please request a new password reset.')
      return
    }

    if (!isValidCommerceLayerConfig(clientConfig)) {
      setApiError('Configuration error. Please try again later.')
      return
    }

    try {
      const client = getCommerceLayer(clientConfig)

      await client.customer_password_resets.update(token, {
        customer_password: formData.password,
        customer_password_confirmation: formData.confirmPassword,
      })

      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      const errorMessage =
        error?.errors?.[0]?.detail ||
        'Failed to reset password. The link may have expired.'
      setApiError(errorMessage)
    }
  })

  if (isLoading) {
    return (
      <Container maxW="md" py={8}>
        <Text>Loading...</Text>
      </Container>
    )
  }

  if (isSuccess) {
    return (
      <Container maxW="md" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4} color="green.500">
            Password reset successful!
          </Heading>
          <Text mb={6} color="gray.600">
            Your password has been updated. You'll be redirected to the login
            page shortly.
          </Text>
          <ChakraLink as={Link} href="/" color="blue.500">
            Go to login now
          </ChakraLink>
        </Box>
      </Container>
    )
  }

  if (!token && apiError) {
    return (
      <Container maxW="md" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4} color="red.500">
            Invalid Reset Link
          </Heading>
          <Text mb={6} color="gray.600">
            This password reset link is invalid or has expired.
          </Text>
          <ChakraLink as={Link} href="/forgot-password" color="blue.500">
            Request a new reset link
          </ChakraLink>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="md" py={8}>
      <Box>
        <Heading size="lg" mb={2}>
          Reset your password
        </Heading>
        <Text mb={6} color="gray.600">
          Enter your new password below.
        </Text>

        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <Stack gap={4}>
              <PasswordInput
                name="password"
                label="New password"
                placeholder="Enter your new password"
              />

              <Box w={'50%'}>
                <PasswordStrengthMeter value={passwordStrength} py={1} />
              </Box>

              <PasswordInput
                name="confirmPassword"
                label="Confirm new password"
                placeholder="Confirm your new password"
              />

              {apiError && <Alert status="error">{apiError}</Alert>}

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText="Updating..."
                disabled={isSubmitting}
                variant="solid"
                colorScheme="blue"
              >
                Update password
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
