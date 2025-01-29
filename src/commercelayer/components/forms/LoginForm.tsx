import { authenticate } from '@commercelayer/js-auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Input } from '@/commercelayer/components/ui/Input'
import { useIdentityContext } from '@/commercelayer/providers/Identity'

import {
  Button,
  // Input,
  Link as ChakraLink,
} from '@chakra-ui/react'
import Link from 'next/link'

import { setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'
import type { LoginFormValues } from 'Forms'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup.string().required('Password is required'),
})

export const LoginForm = ({ emailAddress }): JSX.Element => {
  const { settings, config, customer, isLoading, handleLogin } =
    useIdentityContext()

  // Loading IdentityProvider settings
  if (isLoading) {
    return <div>Loading</div>
  }

  // Loading IdentityProvider settings are valid?
  if (!settings?.isValid) {
    return <div>Application error (Commerce Layer).</div>
  }

  const customerEmail =
    (customer.email && customer.email.length > 0) || emailAddress
  // @TODO: password reset flow (?)
  const resetPasswordUrl = false // config.resetPasswordUrl ?? ''

  const form: UseFormReturn<LoginFormValues, UseFormProps> =
    useForm<LoginFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: customerEmail ?? '' },
    })

  const isSubmitting = form.formState.isSubmitting
  const onSubmit = form.handleSubmit(async (formData) => {
    await authenticate('password', {
      clientId: config.clientId,
      domain: config.domain,
      scope: config.scope, // marketId
      username: formData.customerEmail,
      password: formData.customerPassword,
    })
      .then((tokenData) => {
        if (tokenData.accessToken != null) {
          handleLogin(tokenData)
        } else {
          form.setError('root', {
            type: 'custom',
            message: 'Invalid credentials',
          })
        }
      })
      .catch(() => {
        form.setError('root', {
          type: 'custom',
          message: 'Invalid credentials',
        })
      })
  })

  return settings.isGuest ? (
    <FormProvider {...form}>
      <form
        className="mt-8 mb-0"
        onSubmit={(e) => {
          void onSubmit(e)
        }}
      >
        <div className="space-y-4">
          <Input name="customerEmail" label="Email" type="email" />
          <Input name="customerPassword" label="Password" type="password" />
          {resetPasswordUrl.length > 0 && (
            <div className="text-right">
              <ChakraLink
                as={Link}
                href={`${resetPasswordUrl}`}
                target="_blank"
              >
                Forgot password?
              </ChakraLink>
            </div>
          )}
          <div className="flex pt-4">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? '...' : 'Login'}
            </Button>
          </div>
          {form.formState.errors?.root != null && (
            <div className="pt-4">
              <div>Alert - danger - Invalid credentials</div>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  ) : (
    <>{`Logged in as ${customer.email}`}</>
  )
}
