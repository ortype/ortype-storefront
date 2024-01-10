import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
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

export const LoginForm: React.FC<Props> = () => {
  const customerContext = useContext(CustomerContext)
  const settingsCtx = useContext(SettingsContext)
  const handleLogin = (customer) => settingsCtx?.handleLogin(customer)

  console.log('settingsCtx: ', settingsCtx)
  console.log('customerContext: ', customerContext)

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
      <FormControl>
        <FormLabel>{'Email'}</FormLabel>
        <Input
          // placeholder={customer.username}
          name={'email'}
          type={'email'}
          // onBlur={handleOnBlur}
          ref={validation}
          size={'lg'}
          defaultValue={customerContext.email}
        />
      </FormControl>
      <FormControl>
        <FormLabel>{'Password'}</FormLabel>
        <Input
          // placeholder={customer.password}
          name={'password'}
          // onBlur={handleOnBlur}
          ref={validation}
          size={'lg'}
        />
      </FormControl>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Login</Button>
      </Stack>
    </form>
  ) : (
    <>{`Logged in as ${customerContext.email}`}</>
  )
}
