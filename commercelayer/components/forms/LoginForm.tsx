import { authenticate } from '@commercelayer/js-auth'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { useIdentityContext } from '@/commercelayer/providers/Identity'
import { Input } from '@/commercelayer/components/ui/Input'

import Link from 'next/link'
import {
  Button,
  // Input,
  Link as ChakraLink,
} from '@chakra-ui/react'


import type { LoginFormValues } from 'Forms'
import type { UseFormProps, UseFormReturn } from 'react-hook-form'
import { setStoredCustomerToken } from '@/commercelayer/utils/oauthStorage'

const validationSchema = yup.object().shape({
  customerEmail: yup
    .string()
    .email('Email is invalid')
    .required('Email is required'),
  customerPassword: yup.string().required('Password is required')
})

export const LoginForm = (): JSX.Element => {
  const { settings, config, handleLogin } = useIdentityContext()

  // get customerEmail from Context Provider (??)
  const customerEmail = settings.customerEmail ?? ''
  const resetPasswordUrl = config.resetPasswordUrl ?? ''

  const form: UseFormReturn<LoginFormValues, UseFormProps> =
    useForm<LoginFormValues>({
      resolver: yupResolver(validationSchema),
      defaultValues: { customerEmail: customerEmail ?? '' }
    })

  const isSubmitting = form.formState.isSubmitting
  const onSubmit = form.handleSubmit(async (formData) => {
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
        } else {
          form.setError('root', {
            type: 'custom',
            message: 'Invalid credentials'
          })
        }
      })
      .catch(() => {
        form.setError('root', {
          type: 'custom',
          message: 'Invalid credentials'
        })
      })
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
          {resetPasswordUrl.length > 0 && (
            <div className='text-right'>
              <ChakraLink as={Link} href={`${resetPasswordUrl}`} target='_blank'>
                Forgot password?
              </ChakraLink>
            </div>
          )}
          <div className='flex pt-4'>
            <Button disabled={isSubmitting} type='submit'>
              {isSubmitting ? '...' : 'Login'}
            </Button>
          </div>
          {form.formState.errors?.root != null && (
            <div className='pt-4'>
              <div>Alert - danger - Invalid credentials</div>
            </div>
          )}
        </div>
      </form>
      {/*<div>
        <p className='pt-6 text-base text-gray-500 font-medium'>
          Don't have an account?{' '} - Sign up link
        </p>
      </div>*/}
    </FormProvider>
  )
}
