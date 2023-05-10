import React, { useState, useEffect } from 'react'
import CommerceLayer, { CustomerCreate } from '@commercelayer/sdk'
import Cookies from 'js-cookie'
import {
  Container,
  Button,
  Link,
  Input,
  FormControl,
  Stack,
  Switch,
  FormLabel,
} from '@chakra-ui/react'
import { useGetToken } from 'hooks/GetToken'
import FontPage from 'components/FontPage'
import { useRapidForm } from 'rapid-form'

const LoginForm = ({
  customer,
  cl,
  accessToken,
  setCustomer,
  userMode,
  setUserMode,
}) => {
  const { handleSubmit, submitValidation, validation, values, errors } =
    useRapidForm({
      fieldEvent: 'blur',
    })

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
      setCustomer({ username: email, password })
    }
  }

  return (
    <Container my={8}>
      <form
        ref={submitValidation}
        autoComplete="off"
        onSubmit={handleSubmit(s)}
      >
        <FormControl>
          <FormLabel>{'Email'}</FormLabel>
          <Input
            placeholder={customer.username}
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
            placeholder={customer.password}
            name={'password'}
            onBlur={handleOnBlur}
            ref={validation}
            size={'lg'}
            // value={values['password']?.value}
          />
        </FormControl>

        <Stack my={4} direction={'row'} spacing={4}>
          {!userMode && <Button type={'submit'}>Sign up</Button>}
          {userMode && (
            <Button
              as={Link}
              href={`http://localhost:3002/orders?accessToken=${accessToken}`}
              isExternal
            >
              {'My account'}
            </Button>
          )}
        </Stack>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="user-mode" mb="0">
            Enable "logged in" user
          </FormLabel>
          <Switch
            id="user-mode"
            isChecked={userMode}
            onChange={(e) => {
              // Cookies.remove('clAccessToken')
              setUserMode(e.target.checked)
            }}
          />
        </FormControl>
      </form>
    </Container>
  )
}

const TokenWrapper = ({
  preview,
  loading,
  moreFonts,
  font,
  settings,
  endpoint,
  clientId,
  marketId,
}) => {
  const [userMode, setUserMode] = useState(true)
  const [customer, setCustomer] = useState({})

  useEffect(() => {
    setCustomer(
      userMode
        ? {
            username: 'newww@owenhoskins.com',
            password: '123456',
          }
        : {}
    )
  }, [userMode])

  const accessToken = useGetToken({
    clientId,
    endpoint,
    scope: marketId,
    customer,
    userMode,
  })

  let cl
  if (accessToken) {
    cl = CommerceLayer({
      organization: 'or-type-mvp',
      accessToken,
    })
  }

  return (
    <>
      <LoginForm
        cl={cl}
        customer={customer}
        setCustomer={setCustomer}
        userMode={userMode}
        setUserMode={setUserMode}
        accessToken={accessToken}
      />
      <FontPage
        // loading
        // preview
        cl={cl}
        font={font}
        moreFonts={moreFonts}
        settings={settings}
        endpoint={endpoint}
        accessToken={accessToken}
      />
    </>
  )
}

export default TokenWrapper
