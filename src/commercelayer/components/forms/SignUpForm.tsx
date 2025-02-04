import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Input } from '@/commercelayer/components/ui/Input'
import { useIdentityContext } from '@/commercelayer/providers/Identity'

import { Button, Link as ChakraLink, Fieldset, Stack } from '@chakra-ui/react'
import Link from 'next/link'

import { setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'
import type { SignUpFormValues } from 'Forms'
import { useState } from 'react'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'
import { ValidationApiError } from './ValidationApiError'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup.string().required('Password is required'),
  customerConfirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('customerPassword'), ''], 'Passwords must match'),
})

export const SignUpForm = ({ emailAddress }): JSX.Element => {
  const { settings, config, isLoading, handleLogin, customer } =
    useIdentityContext()
  const [apiError, setApiError] = useState({})
  const customerEmail =
    (customer.email && customer.email.length > 0) || emailAddress

  // Loading IdentityProvider settings
  if (isLoading) {
    return <div>Loading</div>
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
  }

  const form: UseFormReturn<SignUpFormValues, UseFormProps> =
    useForm<SignUpFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: customerEmail ?? '' },
    })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (formData) => {
    const client = CommerceLayer({
      organization: settings.companySlug,
      accessToken: settings.accessToken,
      domain: config.domain,
    })

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
        .then((tokenData) => {
          if (tokenData.accessToken != null) {
            handleLogin(tokenData)
          }
        })
        .catch(() => {
          form.setError('root', {
            type: 'custom',
            message: 'Invalid credentials',
          })
        })
    }
  })

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
              <Input name="customerPassword" label="Password" type="password" />
              <Input
                name="customerConfirmPassword"
                label="Confirm password"
                type="password"
              />
              <Button
                variant={'outline'}
                type="submit"
                alignSelf={'flex-end'}
                loadingText={'Submitting'}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {'Login'}
              </Button>

              {form.formState.errors?.root != null && (
                <Fieldset.ErrorText>
                  Alert - danger - Invalid credentials
                </Fieldset.ErrorText>
              )}
            </Stack>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>
    </FormProvider>
  )
}
