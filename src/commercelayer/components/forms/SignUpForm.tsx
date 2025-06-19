import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import { authenticate } from '@commercelayer/js-auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Input } from '@/commercelayer/components/ui/Input'
import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { useCheckoutContext } from '@/commercelayer/providers/checkout'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'

import { Alert } from '@/components/ui/alert'
import {
  Box,
  Button,
  Link as ChakraLink,
  Fieldset,
  Stack,
} from '@chakra-ui/react'

import type { SignUpFormValues } from 'Forms'
import { useState } from 'react'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup
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
  customerConfirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('customerPassword'), ''], 'Passwords must match'),
})

export const SignUpForm = ({ emailAddress }): JSX.Element => {
  const { settings, clientConfig, config, isLoading, handleLogin, customer } =
    useIdentityContext()
  const { setCustomerPassword } = useCheckoutContext()
  const [apiError, setApiError] = useState({})

  console.log('SignUpForm', customer)

  const form: UseFormReturn<SignUpFormValues, UseFormProps> =
    useForm<SignUpFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: emailAddress ?? '' },
    })

  const isSubmitting = form.formState.isSubmitting

  // Watch the password field for strength calculation
  const watchedPassword = form.watch('customerPassword')

  // Calculate password strength (0-4 scale)
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let score = 0

    // Length check
    if (password.length >= 8) score++

    // Lowercase and uppercase
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++

    // Numbers
    if (/\d/.test(password)) score++

    // Special characters
    if (/[^\w\s]/.test(password)) score++

    return score
  }

  const passwordStrength = calculatePasswordStrength(watchedPassword || '')

  const onSubmit = form.handleSubmit(async (formData) => {
    if (!isValidCommerceLayerConfig(clientConfig)) {
      setApiError({
        errors: [{ detail: 'Invalid Commerce Layer configuration' }],
      })
      return
    }

    // Check if customer exists and has no password (shortcut signup case)
    if (customer.userMode && customer.email && !customer.hasPassword) {
      try {
        // Use Commerce Layer's shortcut to sign up the associated customer
        const result = await setCustomerPassword(formData.customerPassword)

        if (result.success) {
          // After successful password setup, authenticate the customer
          await authenticate('password', {
            clientId: config.clientId,
            domain: config.domain,
            scope: config.scope,
            username: formData.customerEmail,
            password: formData.customerPassword,
          })
            .then(async (tokenData) => {
              if (tokenData.accessToken != null) {
                await handleLogin(tokenData)
              }
            })
            .catch((err) => {
              form.setError('root', {
                type: 'custom',
                message: 'Authentication failed after password setup',
              })
            })
        } else {
          form.setError('root', {
            type: 'custom',
            message: 'Failed to set customer password',
          })
        }
      } catch (error) {
        form.setError('root', {
          type: 'custom',
          message: 'Failed to set customer password',
        })
      }
      return
    }

    // Regular customer creation flow
    const client = getCommerceLayer(clientConfig)

    const createCustomerResponse = await client.customers
      .create({
        email: formData.customerEmail,
        password: formData.customerPassword,
      })
      .catch((e) => {
        const apiError = { errors: e.errors }
        setApiError(apiError)
      })

    if (createCustomerResponse?.id != null) {
      await authenticate('password', {
        clientId: config.clientId,
        domain: config.domain,
        scope: config.scope,
        username: formData.customerEmail,
        password: formData.customerPassword,
      })
        .then(async (tokenData) => {
          if (tokenData.accessToken != null) {
            await handleLogin(tokenData)
          }
        })
        .catch((err) => {
          form.setError('root', {
            type: 'custom',
            message: 'Invalid credentials',
          })
        })
    }
  })

  // Loading IdentityProvider settings
  if (isLoading) {
    return <div>Loading</div>
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          void onSubmit(e)
        }}
      >
        <Fieldset.Root size="lg" maxW="sm">
          <Fieldset.Content>
            <Stack gap="4" align="flex-start" minW={'sm'} maxW="sm">
              <Input name="customerEmail" label="Email" type="email" />
              <PasswordInput name="customerPassword" label="Password" />
              <PasswordInput
                name="customerConfirmPassword"
                label="Confirm Password"
              />
              <Box w={'50%'}>
                <PasswordStrengthMeter value={passwordStrength} py={1} />
              </Box>
              <Button
                variant={'outline'}
                type="submit"
                alignSelf={'flex-end'}
                loadingText={'Submitting'}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {'Sign Up'}
              </Button>

              {form.formState.errors.root && (
                <Alert status="error" my="4">
                  {form.formState.errors.root.message}
                </Alert>
              )}
            </Stack>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>
    </FormProvider>
  )
}
