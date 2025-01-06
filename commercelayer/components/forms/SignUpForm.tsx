import { authenticate } from '@commercelayer/js-auth'
import CommerceLayer from '@commercelayer/sdk'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { Input } from '@/commercelayer/components/ui/Input'
import { useIdentityContext } from '@/commercelayer/providers/Identity'

import Link from 'next/link'
import {
  Button,
  // Input,
  Link as ChakraLink,
} from '@chakra-ui/react'

import type { SignUpFormValues } from 'Forms'
import { useState } from 'react'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'
import { ValidationApiError } from './ValidationApiError'
import { setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup.string().required('Password is required'),
  customerConfirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('customerPassword'), ''], 'Passwords must match')
})

export const SignUpForm = (): JSX.Element => {
  const { settings, config, handleLogin } = useIdentityContext()
  const [apiError, setApiError] = useState({})
  // @TODO: where does customerEmail come from?
  const customerEmail = settings.customerEmail ?? ''

  const form: UseFormReturn<SignUpFormValues, UseFormProps> =
    useForm<SignUpFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: customerEmail ?? '' }
    })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = form.handleSubmit(async (formData) => {
    const client = CommerceLayer({
      organization: settings.companySlug,
      accessToken: settings.accessToken,
      domain: config.domain
    })

    const createCustomerResponse = await client.customers
      .create({
        email: formData.customerEmail,
        password: formData.customerPassword
      })
      .catch((e) => {
        const apiError = { errors: e.errors }
        setApiError(apiError)
      })

    if (createCustomerResponse?.id != null) {
      await authenticate('password', {
        clientId: settings.clientId,
        domain: config.domain,
        scope: settings.scope,
        username: formData.customerEmail,
        password: formData.customerPassword
      })
        .then((tokenData) => {
          if (tokenData.accessToken != null) {
            handleLogin(tokenData)
          }
        })
        .catch(() => {
          form.setError('root', {
            type: 'custom',
            message: 'Invalid credentials'
          })
        })
    }
  })

  return (
    <FormProvider {...form}>
      <form
        className='mt-8 mb-0'
        onSubmit={(e) => {
          void onSubmit(e)
        }}
      >
        <div className='space-y-4'>
          <Input name='customerEmail' label='Email' type='email' />
          <Input name='customerPassword' label='Password' type='password' />
          <Input
            name='customerConfirmPassword'
            label='Confirm password'
            type='password'
          />
          <div className='flex pt-4'>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? '...' : 'Sign up'}
            </Button>
          </div>
          <ValidationApiError
            apiError={apiError}
            fieldMap={{
              email: 'customerEmail',
              password: 'customerPassword'
            }}
          />
        </div>
      </form>
      {/*<div>
        <p className='pt-6 text-base text-gray-500 font-medium'>
          Already have an account?{' '} Login link
        </p>
      </div>*/}
    </FormProvider>
  )
}
