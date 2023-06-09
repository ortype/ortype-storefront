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
import FontPage from 'components/FontPage'
import Cookies from 'js-cookie'
import { getInfoFromJwt } from 'lib/utils/getInfoFromJwt'
import { CustomerContext } from 'providers/CustomerProvider'
import { SettingsContext } from 'providers/SettingsProvider'
import { useRapidForm } from 'rapid-form'
import React, { useContext, useEffect, useState } from 'react'

// @TODO:

// Login / logout
// Register

const LogoutForm = ({ customer, handleLogout }) => {
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

  const s = async (values, err, e) => {
    console.log('s: ', values, err)
    Cookies.remove('clAccessToken')
    handleLogout()
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
        {'Exisiting User'}
      </Heading>
      <Stack my={4} direction={'row'} spacing={4}>
        Logged in as {customer?.username}
        <Button type={'submit'}>Logout</Button>
      </Stack>
    </form>
  )
}

const LoginForm = ({ customer, handleLogin }) => {
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
          // value={values['email']?.value}
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
          // value={values['password']?.value}
        />
      </FormControl>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Login</Button>
      </Stack>
    </form>
  )
}

const RegisterForm = ({ cl, handleRegister }) => {
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm()

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
          // value={values['email']?.value}
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
          // value={values['password']?.value}
        />
      </FormControl>
      <Stack my={4} direction={'row'} spacing={4}>
        <Button type={'submit'}>Sign up</Button>
      </Stack>
    </form>
  )
}

const TokenWrapper = ({
  preview,
  loading,
  moreFonts,
  font,
  endpoint,
  clientId,
  marketId,
  siteSettings,
}) => {
  const appCtx = useContext(CustomerContext)
  // @TODO: get customer data from appCtx is missing something currently
  const settingsCtx = useContext(SettingsContext)
  const handleLogin = (customer) => settingsCtx?.handleLogin(customer)
  const handleLogout = () => settingsCtx?.handleLogout()
  const handleRegister = (customer) => settingsCtx?.handleRegister(customer)
  const isGuest = settingsCtx?.settings?.isGuest

  let cl
  if (appCtx?.accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken: appCtx?.accessToken,
    })
  }

  return (
    <>
      <Container py={8}>
        <SimpleGrid columns={2} spacing={8}>
          <RegisterForm cl={cl} handleRegister={handleRegister} />
          {isGuest ? (
            <LoginForm customer={{}} handleLogin={handleLogin} />
          ) : (
            <LogoutForm handleLogout={handleLogout} customer={{}} />
          )}
        </SimpleGrid>
        <Stack my={4} direction={'row'} spacing={4}>
          {!isGuest && (
            <Button
              as={Link}
              href={`http://localhost:3001/orders?accessToken=${appCtx?.accessToken}`}
              isExternal
            >
              {'My account'}
            </Button>
          )}
        </Stack>
      </Container>
      <FontPage
        // loading
        // preview
        cl={cl}
        font={font}
        moreFonts={moreFonts}
        siteSettings={siteSettings}
        endpoint={endpoint}
        accessToken={appCtx?.accessToken}
      />
    </>
  )
}

export default TokenWrapper
