import {
  PasswordInput,
  PasswordStrengthMeter,
} from '@/components/ui/password-input'
import { authenticate } from '@commercelayer/js-auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import getCommerceLayer, {
  isValidCommerceLayerConfig,
} from '@/commercelayer/utils/getCommerceLayer'

import { Alert } from '@/components/ui/alert'
import {
  Box,
  Button,
  Center,
  Spinner,
  Link as ChakraLink,
  Container,
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

interface SignUpFormProps {
  emailAddress?: string
  onSuccess?: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  emailAddress,
  onSuccess,
}): JSX.Element => {
  const { settings, clientConfig, config, isLoading, handleLogin, customer } =
    useIdentityContext()

  const [apiError, setApiError] = useState({})

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

    // Regular customer creation flow
    const client = getCommerceLayer(clientConfig)

    const createCustomerResponse = await client.customers
      .create({
        email: formData.customerEmail,
        password: formData.customerPassword,
        metadata: { full_name: formData.customerName },
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
            if (onSuccess) {
              onSuccess()
            }
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
    return (
      <Container
        my={6}
        maxW={'30rem'}
        minH={'40rem'}
        justifyContent={'center'}
        centerContent
        position={'relative'}
      >
        <Box inset="0" minH={16}>
          <Center h="full">
            <Spinner color="black" size={'xl'} />
          </Center>
        </Box>
      </Container>
    )
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
  }

  return (
    <FormProvider {...form}>
      <Box
        as={'form'}
        onSubmit={(e) => {
          void onSubmit(e)
        }}
      >
        <Fieldset.Root>
          <Fieldset.Content>
            <Stack gap={2} minW={'sm'}>
              <FloatingLabelInput
                name="customerEmail"
                label="Email"
                type="email"
                variant="subtle"
                size="lg"
                fontSize="lg"
                borderRadius={0}
              />
              <FloatingLabelInput
                name="customerName"
                label="Full name"
                type="text"
                variant="subtle"
                size="lg"
                fontSize="lg"
                borderRadius={0}
              />
              <PasswordInput name="customerPassword" label="Password" />
              <PasswordInput
                name="customerConfirmPassword"
                label="Confirm Password"
              />

              <Button
                variant={'subtle'}
                w={'full'}
                borderColor={'brand.50'}
                borderWidth={'2px'}
                bg={'brand.50'}
                _hover={{ bg: 'brand.50', borderColor: 'black' }}
                borderRadius={'full'}
                size={'sm'}
                py={5}
                fontSize={'lg'}
                type="submit"
                loadingText={'Submitting'}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {'Register now'}
              </Button>
              <Box w={'full'}>
                <PasswordStrengthMeter value={passwordStrength} pt={1} />
              </Box>

              {form.formState.errors.root && (
                <Alert status="error" my="4">
                  {form.formState.errors.root.message}
                </Alert>
              )}
            </Stack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </FormProvider>
  )
}
