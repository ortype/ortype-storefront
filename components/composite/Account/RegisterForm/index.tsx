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

interface Props {}

export const RegisterForm: React.FC<Props> = () => {
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
      <FormControl>
        <FormLabel>{'Email'}</FormLabel>
        <Input
          // placeholder={customer.username}
          name={'email'}
          type={'email'}
          onBlur={handleOnBlur}
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
          onBlur={handleOnBlur}
          ref={validation}
          size={'lg'}
        />
      </FormControl>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Sign up</Button>
      </Stack>
    </form>
  )
}
