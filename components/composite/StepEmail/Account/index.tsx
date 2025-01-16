import { Field } from '@/components/ui/field'
import {
  Box,
  Button,
  Container,
  Fieldset,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Switch,
} from '@chakra-ui/react'
import CommerceLayer, { CustomerCreate } from '@commercelayer/sdk'
import { CustomerContext } from 'components/data/CustomerProvider'
import { SettingsContext } from 'components/data/SettingsProvider'
import Cookies from 'js-cookie'
import { useRapidForm } from 'rapid-form'
import React, { useContext, useEffect, useState } from 'react'

interface Props {
  emailAddress: string
}

export const RegisterForm: React.FC<Props> = ({ emailAddress }) => {
  const customerContext = useContext(CustomerContext)
  const settingsCtx = useContext(SettingsContext)
  const handleRegister = (customer) => settingsCtx?.handleRegister(customer)
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  let cl
  if (customerContext?.accessToken) {
    cl = CommerceLayer({
      organization: process.env.NEXT_PUBLIC_CL_SLUG || '',
      accessToken: customerContext?.accessToken,
    })
  }

  // @TODO:
  // - Validate fields (e.g. password longer than 6 characters)
  // - Add error messages (e.g. username already taken)

  const handleOnBlur = async (value): Promise<void> => {}

  const s = async (values, err, e) => {
    console.log('s: ', values, err)
    /*    if (_.isEmpty(err)) {
      reset(e)
    }*/

    const email = values['email'].value
    const password = values['password'].value

    if (email && password) {
      const attrs: CustomerCreate = {
        email,
        password,
      }
      const customer = await cl.customers.create(attrs)
      console.log('Register Customer: ', customer)
      handleRegister({ username: email, password })
    }
  }
  return (
    <form
      as={Box}
      ref={submitValidation}
      autoComplete="off"
      onSubmit={handleSubmit(s)}
    >
      <Heading
        as={'h5'}
        fontSize={20}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'New User'}
      </Heading>
      <Fieldset.Root>
        <Field label={'Email'}>
          <Input
            // placeholder={customer.username}
            name={'email'}
            type={'email'}
            onBlur={handleOnBlur}
            ref={validation}
            size={'lg'}
            defaultValue={emailAddress}
          />
        </Field>
      </Fieldset.Root>
      <Fieldset.Root>
        <Field label={'Password'}>
          <Input
            // placeholder={customer.password}
            name={'password'}
            onBlur={handleOnBlur}
            ref={validation}
            size={'lg'}
          />
        </Field>
      </Fieldset.Root>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Sign up</Button>
      </Stack>
    </form>
  )
}

export const LoginForm: React.FC<Props> = ({ emailAddress }) => {
  const customerContext = useContext(CustomerContext)
  const settingsCtx = useContext(SettingsContext)
  const handleLogin = (customer) => settingsCtx?.handleLogin(customer)

  let cl
  if (customerContext?.accessToken) {
    cl = CommerceLayer({
      organization: process.env.NEXT_PUBLIC_CL_SLUG || '',
      accessToken: customerContext?.accessToken,
    })
  }

  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  const s = async (values, err, e) => {
    console.log('s: ', values, err)
    /*    if (_.isEmpty(err)) {
      reset(e)
    }*/
    Cookies.remove('clAccessToken')
    const email = values['email'].value
    const password = values['password'].value
    handleLogin({ username: email, password })
  }

  return settingsCtx.settings.isGuest ? (
    <form
      as={Box}
      ref={submitValidation}
      autoComplete="off"
      onSubmit={handleSubmit(s)}
    >
      <Heading
        as={'h5'}
        fontSize={20}
        textTransform={'uppercase'}
        fontWeight={'normal'}
      >
        {'Exisiting User'}
      </Heading>
      <Fieldset.Root>
        <Field label={'Email'}>
          <Input
            // placeholder={customer.username}
            name={'email'}
            type={'email'}
            // onBlur={handleOnBlur}
            ref={validation}
            size={'lg'}
            defaultValue={emailAddress}
          />
        </Field>
      </Fieldset.Root>
      <Fieldset.Root>
        <Field label={'Password'}>
          <Input
            // placeholder={customer.password}
            name={'password'}
            // onBlur={handleOnBlur}
            ref={validation}
            size={'lg'}
          />
        </Field>
      </Fieldset.Root>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Login</Button>
      </Stack>
    </form>
  ) : (
    <>{`Logged in as ${emailAddress}`}</>
  )
}
