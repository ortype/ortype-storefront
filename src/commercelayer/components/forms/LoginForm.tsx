import { authenticate } from '@commercelayer/js-auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { FloatingLabelInput } from '@/commercelayer/components/ui/floating-label-input'
import { useIdentityContext } from '@/commercelayer/providers/identity'
import { parseAuthError } from '@/commercelayer/utils/parseAuthError'
import { useDevLogger } from '@/hooks/useDevLogger'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/chakra-button'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Box,
  Center,
  Link as ChakraLink,
  Container,
  Fieldset,
  Flex,
  Spinner,
  Stack,
  Text,
  useStepsContext,
} from '@chakra-ui/react'
import type { LoginFormValues } from 'Forms'
import Link from 'next/link'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup.string().required('Password is required'),
})

interface LoginFormProps {
  emailAddress?: string
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  emailAddress,
  onSuccess,
}) => {
  const { settings, config, isLoading, handleLogin } = useIdentityContext()
  // Try to get Steps context if available (for checkout flow)
  let stepsContext = null
  try {
    stepsContext = useStepsContext()
  } catch {
    // Steps context not available - this is expected when LoginForm is used outside of checkout flow
    stepsContext = null
  }
  const log = useDevLogger()
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0)

  const form: UseFormReturn<LoginFormValues, UseFormProps> =
    useForm<LoginFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: emailAddress ?? '' },
    })

  const isSubmitting = form.formState.isSubmitting
  const isRateLimited = rateLimitCountdown > 0

  // Effect to handle rate limit countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (rateLimitCountdown > 0) {
      interval = setInterval(() => {
        setRateLimitCountdown((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [rateLimitCountdown])

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

  const onSubmit = form.handleSubmit(async (formData) => {
    try {
      const tokenData = await authenticate('password', {
        clientId: config.clientId,
        domain: config.domain,
        scope: config.scope, // marketId
        username: formData.customerEmail,
        password: formData.customerPassword,
      })
      if (tokenData.accessToken) {
        await handleLogin(tokenData)
        console.log('✅ Login successful')

        // Handle success based on context:
        // 1. If in checkout flow (Steps context available), advance to next step
        // 2. If in global header (onSuccess callback provided), call it
        if (stepsContext && stepsContext.goToNextStep) {
          console.log('🚀 Advancing to next step after successful login')
          stepsContext.goToNextStep()
        } else if (onSuccess) {
          console.log('🚀 Calling onSuccess callback after successful login')
          onSuccess()
        } else {
          console.log(
            'ℹ️ Login successful - no step advancement or callback needed'
          )
        }
      } else {
        // If no access token but no error thrown, treat as invalid credentials
        form.setError('root', {
          type: 'INVALID_CREDENTIALS',
          message: 'The email or password you entered is incorrect.',
        })
      }
    } catch (err) {
      const parsed = parseAuthError(err)

      // Handle rate limiting with countdown
      if (parsed.type === 'RATE_LIMIT' && parsed.retryAfter) {
        setRateLimitCountdown(parsed.retryAfter)
        const rateLimitMessage = `Too many attempts. Try again in ${parsed.retryAfter} seconds.`
        form.setError('root', { type: parsed.type, message: rateLimitMessage })
      } else {
        form.setError('root', {
          type: parsed.type,
          message: parsed.userMessage,
        })
      }

      log('LoginForm', parsed, err)
    }
  })

  return settings.isGuest ? (
    <FormProvider {...form}>
      <Box
        as={'form'}
        w={'full'}
        onSubmit={(e) => {
          void onSubmit(e)
        }}
      >
        <Fieldset.Root>
          <Fieldset.Content>
            <Stack gap={2} align="flex-start" minW={'sm'}>
              <FloatingLabelInput
                name="customerEmail"
                label="Email"
                type="email"
                variant="subtle"
                size="lg"
                fontSize="lg"
                borderRadius={0}
              />
              <PasswordInput name="customerPassword" label="Password" />
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
                disabled={isSubmitting || isRateLimited}
                loading={isSubmitting}
              >
                {isRateLimited ? `Wait ${rateLimitCountdown}s` : 'Login'}
              </Button>

              {form.formState.errors.root && (
                <Alert status="error" my="4">
                  {form.formState.errors.root.type === 'RATE_LIMIT' &&
                  rateLimitCountdown > 0
                    ? `Too many attempts. Try again in ${rateLimitCountdown} seconds.`
                    : form.formState.errors.root.message}
                </Alert>
              )}
            </Stack>
          </Fieldset.Content>
        </Fieldset.Root>
      </Box>
    </FormProvider>
  ) : (
    <Flex justifyContent={'center'}>
      <Text textStyle={'md'}>{`Logged in as ${emailAddress}`}</Text>
    </Flex>
  )
}
