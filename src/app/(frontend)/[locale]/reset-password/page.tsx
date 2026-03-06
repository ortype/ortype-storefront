'use client'

import { useIdentityContext } from '@/commercelayer/providers/identity'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'
import { Alert } from '@/components/ui/alert'
import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import {
  Box,
  Button,
  Card,
  Link as ChakraLink,
  Container,
  Group,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

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
  const [resetId, setResetId] = useState<string | null>(null)
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
    const idParam = searchParams.get('id')
    const tokenParam = searchParams.get('token')
    if (!idParam || !tokenParam) {
      setApiError(
        'Invalid or missing reset link. Please request a new password reset.'
      )
    } else {
      setResetId(idParam)
      setToken(tokenParam)
    }
  }, [searchParams])

  const onSubmit = form.handleSubmit(async (formData) => {
    setApiError(null)

    if (!resetId || !token) {
      setApiError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (!isValidCommerceLayerConfig(clientConfig)) {
      setApiError('Configuration error. Please try again later.')
      return
    }

    try {
      const client = getCommerceLayer(clientConfig)

      await client.customer_password_resets.update({
        id: resetId,
        customer_password: formData.password,
        _reset_password_token: token,
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
      <Container
        my={6}
        maxW="40rem"
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`Password reset successful!`}
        </Heading>
        <Card.Root my={2} w={'full'}>
          <Card.Body p={4}>
            <Text textStyle={'md'}>
              {
                "Your password has been updated. You'll be redirected to the login page shortly."
              }
            </Text>
          </Card.Body>
        </Card.Root>
        <Stack gap={4}>
          <Button
            asChild
            size={'2xs'}
            bg={'brand.50'}
            variant={'subtle'}
            borderRadius={'full'}
          >
            <ChakraLink as={Link} href="/">
              Go to login now
            </ChakraLink>
          </Button>
        </Stack>
      </Container>
    )
  }

  if ((!resetId || !token) && apiError) {
    return (
      <Container
        my={6}
        maxW="40rem"
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Heading
          textAlign={'center'}
          fontSize={'2.5rem'}
          fontWeight={'normal'}
          textTransform={'uppercase'}
          mx={'auto'}
          pb={6}
        >
          {`Invalid Reset Link`}
        </Heading>
        <Card.Root my={2} w={'full'}>
          <Card.Body p={4}>
            <Text textStyle={'md'}>
              {'This password reset link is invalid or has expired.'}
            </Text>
          </Card.Body>
        </Card.Root>
        <Stack gap={4}>
          <Button
            asChild
            size={'2xs'}
            bg={'brand.50'}
            variant={'subtle'}
            borderRadius={'full'}
          >
            <ChakraLink as={Link} href="/forgot-password">
              Request a new reset link
            </ChakraLink>
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container
      my={6}
      maxW="40rem"
      minH={'40rem'}
      justifyContent={'center'}
      centerContent
      position={'relative'}
    >
      <Heading
        textAlign={'center'}
        fontSize={'2.5rem'}
        fontWeight={'normal'}
        textTransform={'uppercase'}
        mx={'auto'}
        pb={6}
      >
        {`Reset your password`}
      </Heading>
      <Card.Root my={2} w={'full'}>
        <Card.Body p={4}>
          <Text textStyle={'md'}>{'Enter your new password below.'}</Text>
        </Card.Body>
      </Card.Root>
      <FormProvider {...form}>
        <Box as={'form'} w={'full'} onSubmit={onSubmit}>
          <Stack gap={2}>
            <PasswordInput
              name="password"
              label="New password"
              placeholder="Enter your new password"
            />

            <Box w={'100%'}>
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
              variant={'outline'}
              // bg={'white'}
              borderRadius={'full'}
            >
              Update password
            </Button>
            {apiError && <Alert status="error">{apiError}</Alert>}
            <Group gap={2} justifyContent={'center'}>
              <Text textStyle={'xs'} textAlign="center">
                Remember your password?{' '}
              </Text>
              <Button
                asChild
                size={'2xs'}
                bg={'brand.50'}
                variant={'subtle'}
                borderRadius={'full'}
              >
                <ChakraLink as={Link} href="/">
                  Sign in
                </ChakraLink>
              </Button>
            </Group>
          </Stack>
        </Box>
      </FormProvider>
    </Container>
  )
}
